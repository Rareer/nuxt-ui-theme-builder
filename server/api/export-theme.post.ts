import { defineEventHandler, readBody } from 'h3'
import { createWriteStream } from 'fs'
import { join } from 'path'
import { createGzip } from 'zlib'
import archiver from 'archiver'
import { randomUUID } from 'crypto'
import { promises as fs } from 'fs'

export default defineEventHandler(async (event) => {
  try {
    // Get theme variables from request body
    const { themeVariables } = await readBody<{ themeVariables: Record<string, string> }>(event)
    
    if (!themeVariables) {
      return {
        success: false,
        error: 'No theme variables provided'
      }
    }
    
    // Create a unique temporary directory for this export
    const tempDir = join(process.cwd(), 'tmp', randomUUID())
    await fs.mkdir(tempDir, { recursive: true })
    
    // Create main.css file with the theme variables
    const cssContent = generateCssContent(themeVariables)
    const cssFilePath = join(tempDir, 'main.css')
    await fs.writeFile(cssFilePath, cssContent)
    
    // Create a ZIP file
    const zipFilePath = join(tempDir, 'theme-export.zip')
    await createZipFile(tempDir, zipFilePath, cssFilePath)
    
    // Read the ZIP file as base64
    const zipContent = await fs.readFile(zipFilePath, { encoding: 'base64' })
    
    // Clean up temporary files
    await cleanupTempFiles(tempDir)
    
    return {
      success: true,
      zipContent,
      filename: 'theme-export.zip'
    }
  } catch (error: unknown) {
    console.error('Error exporting theme:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
})

function generateCssContent(themeVariables: Record<string, string>): string {
  let cssContent = `@import "tailwindcss";\n@import "@nuxt/ui";\n\n:root {\n`
  
  // Add all theme variables to the CSS content
  Object.entries(themeVariables).forEach(([key, value]) => {
    cssContent += `  ${key}: ${value};\n`
  })
  
  cssContent += '}\n'
  return cssContent
}

async function createZipFile(tempDir: string, zipFilePath: string, cssFilePath: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const output = createWriteStream(zipFilePath)
    const archive = archiver('zip', {
      zlib: { level: 9 } // Maximum compression
    })
    
    output.on('close', () => {
      resolve()
    })
    
    archive.on('error', (err: Error) => {
      reject(err)
    })
    
    archive.pipe(output)
    
    // Add the CSS file to the ZIP
    archive.file(cssFilePath, { name: 'main.css' })
    
    // Add a README file
    archive.append('# Theme Export\n\nThis ZIP file contains the exported theme variables for your Nuxt UI application.\n\n## Usage\n\nPlace the `main.css` file in your project and import it in your main CSS file.', 
      { name: 'README.md' })
    
    archive.finalize()
  })
}

async function cleanupTempFiles(tempDir: string): Promise<void> {
  try {
    await fs.rm(tempDir, { recursive: true, force: true })
  } catch (error) {
    console.error('Error cleaning up temporary files:', error)
  }
}
