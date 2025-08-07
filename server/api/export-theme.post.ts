import { defineEventHandler, readBody } from 'h3'
import { createWriteStream } from 'fs'
import { join } from 'path'
import { createGzip } from 'zlib'
import archiver from 'archiver'
import { randomUUID } from 'crypto'
import { promises as fs } from 'fs'

export default defineEventHandler(async (event) => {
  try {
    // Get theme variables, custom colors, and theme mappings from request body
    const { themeVariables, customColors, themeMappings } = await readBody<{ 
      themeVariables: Record<string, string>,
      customColors?: Array<{ name: string, values: Record<string, string> }>,
      themeMappings?: Record<string, string | null>
    }>(event)
    
    if (!themeVariables) {
      return {
        success: false,
        error: 'No theme variables provided'
      }
    }
    
    // Create a unique temporary directory for this export
    const tempDir = join(process.cwd(), 'tmp', randomUUID())
    await fs.mkdir(tempDir, { recursive: true })
    
    // Create main.css file with the theme variables and custom colors
    const cssContent = generateCssContent(themeVariables, customColors)
    const cssFilePath = join(tempDir, 'main.css')
    await fs.writeFile(cssFilePath, cssContent)
    
    // Generate app.config.ts content
    const appConfigContent = generateAppConfigContent(themeMappings)
    const appConfigFilePath = join(tempDir, 'app.config.ts')
    await fs.writeFile(appConfigFilePath, appConfigContent)
    
    // Create a ZIP file
    const zipFilePath = join(tempDir, 'theme-export.zip')
    await createZipFile(tempDir, zipFilePath, cssFilePath, appConfigFilePath)
    
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

function generateAppConfigContent(themeMappings?: Record<string, string | null>): string {
  // Start with the basic structure
  let configContent = `export default defineAppConfig({
  ui: {
    colors: {
`;
  
  // Add color mappings if they exist
  if (themeMappings) {
    Object.entries(themeMappings).forEach(([variable, colorName]) => {
      if (colorName) {
        // Format the color name to match Nuxt UI's expected format (lowercase, no spaces)
        const formattedColorName = colorName.toLowerCase().replace(/\s+/g, '-');
        configContent += `      ${variable}: '${formattedColorName}',\n`;
      }
    });
  }
  
  // Close the structure
  configContent += `    }
  }
});
`;
  
  return configContent;
}

function generateCssContent(themeVariables: Record<string, string>, customColors?: Array<{ name: string, values: Record<string, string> }>): string {
  let cssContent = `@import "tailwindcss";\n@import "@nuxt/ui";\n\n:root {\n`
  
  // Add only non-theme CSS variables to the content
  // Theme variables (--ui-primary, --ui-secondary, etc.) will be handled by Nuxt via app.config.ts
  Object.entries(themeVariables).forEach(([key, value]) => {
    // Skip theme variable assignments (primary, secondary, etc.)
    if (!key.match(/^--ui-(primary|secondary|success|info|warning|error)(-\d+)?$/)) {
      cssContent += `  ${key}: ${value};\n`
    }
  })
  
  cssContent += '}\n'
  
  // Add custom colors as CSS variables if they exist
  if (customColors && customColors.length > 0) {
    cssContent += '\n/* Custom Colors */\n:root {\n'
    
    customColors.forEach(color => {
      Object.entries(color.values).forEach(([shade, value]) => {
        cssContent += `  --color-${color.name.toLowerCase()}-${shade}: ${value};\n`
      })
    })
    
    cssContent += '}\n'
  }
  
  return cssContent
}

async function createZipFile(tempDir: string, zipFilePath: string, cssFilePath: string, appConfigFilePath: string): Promise<void> {
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
    
    // Add the app.config.ts file to the ZIP
    archive.file(appConfigFilePath, { name: 'app.config.ts' })
    
    // Add a README file
    archive.append('# Theme Export\n\nThis ZIP file contains the exported theme variables for your Nuxt UI application.\n\n## Usage\n\n1. Place the `main.css` file in your project and import it in your main CSS file.\n2. Copy the `app.config.ts` file to your project root to configure the Nuxt UI color scheme.', 
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
