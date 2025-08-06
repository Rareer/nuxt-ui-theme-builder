export interface TailwindClassGroup {
  label: string
  classes: TailwindClass[]
}

export interface TailwindClass {
  value: string
  label: string
  description?: string
}

// Helper function to generate color classes
const generateColorClasses = (prefix: string, colors: string[]) => {
  const shades = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900']
  const result: TailwindClass[] = []
  
  colors.forEach(color => {
    if (color === 'black' || color === 'white' || color === 'transparent' || color === 'current') {
      result.push({ value: `${prefix}-${color}`, label: `${prefix}-${color}` })
    } else {
      shades.forEach(shade => {
        result.push({ value: `${prefix}-${color}-${shade}`, label: `${prefix}-${color}-${shade}` })
      })
    }
  })
  
  return result
}

// Helper function to generate spacing classes
const generateSpacingClasses = (prefix: string) => {
  const sizes = ['0', '1', '2', '3', '4', '5', '6', '8', '10', '12', '16', '20', '24', '32', '40', '48', '56', '64', 'auto', 'px']
  return sizes.map(size => ({ value: `${prefix}-${size}`, label: `${prefix}-${size}` }))
}

export const useTailwindClasses = () => {
  const colors = ['gray', 'red', 'orange', 'yellow', 'green', 'teal', 'blue', 'indigo', 'purple', 'pink', 'black', 'white', 'transparent', 'current']
  
  const classGroups: TailwindClassGroup[] = [
    {
      label: 'Animation',
      classes: [
        { value: 'ease-linear', label: 'ease-linear' },
        { value: 'ease-in', label: 'ease-in' },
        { value: 'ease-out', label: 'ease-out' },
        { value: 'ease-in-out', label: 'ease-in-out' },
        { value: 'duration-75', label: 'duration-75' },
        { value: 'duration-100', label: 'duration-100' },
        { value: 'duration-150', label: 'duration-150' },
        { value: 'duration-200', label: 'duration-200' },
        { value: 'duration-300', label: 'duration-300' },
        { value: 'duration-500', label: 'duration-500' },
        { value: 'duration-700', label: 'duration-700' },
        { value: 'duration-1000', label: 'duration-1000' },
        { value: 'delay-75', label: 'delay-75' },
        { value: 'delay-100', label: 'delay-100' },
        { value: 'delay-150', label: 'delay-150' },
        { value: 'delay-200', label: 'delay-200' },
        { value: 'delay-300', label: 'delay-300' },
        { value: 'delay-500', label: 'delay-500' },
        { value: 'delay-700', label: 'delay-700' },
        { value: 'delay-1000', label: 'delay-1000' },
        { value: 'transition', label: 'transition' },
        { value: 'transition-all', label: 'transition-all' },
        { value: 'transition-colors', label: 'transition-colors' },
        { value: 'transition-opacity', label: 'transition-opacity' },
        { value: 'transition-shadow', label: 'transition-shadow' },
        { value: 'transition-transform', label: 'transition-transform' }
      ]
    },
    {
      label: 'Animations',
      classes: [
        { value: 'animate-bounce', label: 'animate-bounce' },
        { value: 'animate-none', label: 'animate-none' },
        { value: 'animate-ping', label: 'animate-ping' },
        { value: 'animate-pulse', label: 'animate-pulse' },
        { value: 'animate-spin', label: 'animate-spin' }
      ]
    },
    {
      label: 'Background',
      classes: [
        { value: 'bg-auto', label: 'bg-auto' },
        { value: 'bg-cover', label: 'bg-cover' },
        { value: 'bg-contain', label: 'bg-contain' },
        { value: 'bg-bottom', label: 'bg-bottom' },
        { value: 'bg-top', label: 'bg-top' },
        { value: 'bg-center', label: 'bg-center' },
        { value: 'bg-left', label: 'bg-left' },
        { value: 'bg-left-bottom', label: 'bg-left-bottom' },
        { value: 'bg-left-top', label: 'bg-left-top' },
        { value: 'bg-right', label: 'bg-right' },
        { value: 'bg-right-bottom', label: 'bg-right-bottom' },
        { value: 'bg-right-top', label: 'bg-right-top' },
        { value: 'bg-fixed', label: 'bg-fixed' },
        { value: 'bg-local', label: 'bg-local' },
        { value: 'bg-scroll', label: 'bg-scroll' },
        { value: 'bg-no-repeat', label: 'bg-no-repeat' },
        { value: 'bg-repeat', label: 'bg-repeat' },
        { value: 'bg-repeat-x', label: 'bg-repeat-x' },
        { value: 'bg-repeat-y', label: 'bg-repeat-y' },
        { value: 'bg-repeat-round', label: 'bg-repeat-round' },
        { value: 'bg-repeat-space', label: 'bg-repeat-space' },
        { value: 'bg-none', label: 'bg-none' },
        ...['0', '25', '50', '75', '100'].map(opacity => ({ value: `bg-opacity-${opacity}`, label: `bg-opacity-${opacity}` }))
      ]
    },
    {
      label: 'Background Clip',
      classes: [
        { value: 'bg-clip-border', label: 'bg-clip-border' },
        { value: 'bg-clip-content', label: 'bg-clip-content' },
        { value: 'bg-clip-padding', label: 'bg-clip-padding' },
        { value: 'bg-clip-text', label: 'bg-clip-text' }
      ]
    },
    {
      label: 'Background Color',
      classes: generateColorClasses('bg', colors)
    },
    {
      label: 'Background Gradient',
      classes: [
        { value: 'bg-gradient-to-b', label: 'bg-gradient-to-b' },
        { value: 'bg-gradient-to-bl', label: 'bg-gradient-to-bl' },
        { value: 'bg-gradient-to-br', label: 'bg-gradient-to-br' },
        { value: 'bg-gradient-to-l', label: 'bg-gradient-to-l' },
        { value: 'bg-gradient-to-r', label: 'bg-gradient-to-r' },
        { value: 'bg-gradient-to-t', label: 'bg-gradient-to-t' },
        { value: 'bg-gradient-to-tl', label: 'bg-gradient-to-tl' },
        { value: 'bg-gradient-to-tr', label: 'bg-gradient-to-tr' },
        ...generateColorClasses('from', colors),
        ...generateColorClasses('to', colors),
        ...generateColorClasses('via', colors)
      ]
    },
    {
      label: 'Border Color',
      classes: generateColorClasses('border', colors)
    },
    {
      label: 'Borders',
      classes: [
        { value: 'border-solid', label: 'border-solid' },
        { value: 'border-dashed', label: 'border-dashed' },
        { value: 'border-dotted', label: 'border-dotted' },
        { value: 'border-double', label: 'border-double' },
        { value: 'border-none', label: 'border-none' },
        { value: 'border', label: 'border' },
        { value: 'border-0', label: 'border-0' },
        { value: 'border-2', label: 'border-2' },
        { value: 'border-4', label: 'border-4' },
        { value: 'border-8', label: 'border-8' },
        { value: 'border-t', label: 'border-t' },
        { value: 'border-r', label: 'border-r' },
        { value: 'border-b', label: 'border-b' },
        { value: 'border-l', label: 'border-l' },
        { value: 'border-t-0', label: 'border-t-0' },
        { value: 'border-r-0', label: 'border-r-0' },
        { value: 'border-b-0', label: 'border-b-0' },
        { value: 'border-l-0', label: 'border-l-0' },
        { value: 'border-collapse', label: 'border-collapse' },
        { value: 'border-separate', label: 'border-separate' },
        { value: 'rounded', label: 'rounded' },
        { value: 'rounded-sm', label: 'rounded-sm' },
        { value: 'rounded-md', label: 'rounded-md' },
        { value: 'rounded-lg', label: 'rounded-lg' },
        { value: 'rounded-xl', label: 'rounded-xl' },
        { value: 'rounded-2xl', label: 'rounded-2xl' },
        { value: 'rounded-3xl', label: 'rounded-3xl' },
        { value: 'rounded-full', label: 'rounded-full' },
        { value: 'rounded-none', label: 'rounded-none' },
        ...['t', 'r', 'b', 'l', 'tl', 'tr', 'br', 'bl'].flatMap(side => 
          ['sm', 'md', 'lg', 'xl', '2xl', '3xl', 'full'].map(size => 
            ({ value: `rounded-${side}-${size}`, label: `rounded-${side}-${size}` })
          )
        ),
        ...['0', '25', '50', '75', '100'].map(opacity => ({ value: `border-opacity-${opacity}`, label: `border-opacity-${opacity}` }))
      ]
    },
    {
      label: 'Box',
      classes: [
        { value: 'box-border', label: 'box-border' },
        { value: 'box-content', label: 'box-content' }
      ]
    },
    {
      label: 'Display',
      classes: [
        { value: 'block', label: 'block' },
        { value: 'hidden', label: 'hidden' },
        { value: 'inline', label: 'inline' },
        { value: 'inline-block', label: 'inline-block' },
        { value: 'inline-flex', label: 'inline-flex' },
        { value: 'inline-grid', label: 'inline-grid' },
        { value: 'flex', label: 'flex' },
        { value: 'grid', label: 'grid' },
        { value: 'flow-root', label: 'flow-root' },
        { value: 'contents', label: 'contents' },
        { value: 'table', label: 'table' },
        { value: 'table-caption', label: 'table-caption' },
        { value: 'table-cell', label: 'table-cell' },
        { value: 'table-column', label: 'table-column' },
        { value: 'table-column-group', label: 'table-column-group' },
        { value: 'table-footer-group', label: 'table-footer-group' },
        { value: 'table-header-group', label: 'table-header-group' },
        { value: 'table-row', label: 'table-row' },
        { value: 'table-row-group', label: 'table-row-group' }
      ]
    },
    {
      label: 'Flexbox & Grid',
      classes: [
        { value: 'flex-row', label: 'flex-row' },
        { value: 'flex-col', label: 'flex-col' },
        { value: 'flex-wrap', label: 'flex-wrap' },
        { value: 'flex-nowrap', label: 'flex-nowrap' },
        { value: 'justify-start', label: 'justify-start' },
        { value: 'justify-center', label: 'justify-center' },
        { value: 'justify-end', label: 'justify-end' },
        { value: 'justify-between', label: 'justify-between' },
        { value: 'justify-around', label: 'justify-around' },
        { value: 'items-start', label: 'items-start' },
        { value: 'items-center', label: 'items-center' },
        { value: 'items-end', label: 'items-end' },
        { value: 'items-stretch', label: 'items-stretch' },
        { value: 'grid-cols-1', label: 'grid-cols-1' },
        { value: 'grid-cols-2', label: 'grid-cols-2' },
        { value: 'grid-cols-3', label: 'grid-cols-3' },
        { value: 'grid-cols-4', label: 'grid-cols-4' },
        { value: 'grid-cols-6', label: 'grid-cols-6' },
        { value: 'grid-cols-12', label: 'grid-cols-12' },
        { value: 'gap-1', label: 'gap-1' },
        { value: 'gap-2', label: 'gap-2' },
        { value: 'gap-4', label: 'gap-4' },
        { value: 'gap-6', label: 'gap-6' },
        { value: 'gap-8', label: 'gap-8' },
        { value: 'gap-10', label: 'gap-10' },
        { value: 'gap-12', label: 'gap-12' },
        { value: 'gap-16', label: 'gap-16' },
        { value: 'gap-20', label: 'gap-20' },
        { value: 'gap-24', label: 'gap-24' },
        { value: 'gap-32', label: 'gap-32' },
        { value: 'gap-40', label: 'gap-40' },
        { value: 'gap-48', label: 'gap-48' },
        { value: 'gap-56', label: 'gap-56' },
        { value: 'gap-64', label: 'gap-64' },
        { value: 'gap-px', label: 'gap-px' },
        ...['x', 'y'].flatMap(axis => 
          ['0', '1', '2', '3', '4', '5', '6', '8', '10', '12', '16', '20', '24', '32', '40', '48', '56', '64', 'px'].map(size => 
            ({ value: `gap-${axis}-${size}`, label: `gap-${axis}-${size}` })
          )
        ),
        // Grid template columns
        ...Array.from({length: 12}, (_, i) => ({ value: `grid-cols-${i + 1}`, label: `grid-cols-${i + 1}` })),
        { value: 'grid-cols-none', label: 'grid-cols-none' },
        // Grid template rows
        ...Array.from({length: 6}, (_, i) => ({ value: `grid-rows-${i + 1}`, label: `grid-rows-${i + 1}` })),
        { value: 'grid-rows-none', label: 'grid-rows-none' },
        // Grid column span
        ...Array.from({length: 12}, (_, i) => ({ value: `col-span-${i + 1}`, label: `col-span-${i + 1}` })),
        { value: 'col-span-full', label: 'col-span-full' },
        { value: 'col-auto', label: 'col-auto' },
        // Grid row span
        ...Array.from({length: 6}, (_, i) => ({ value: `row-span-${i + 1}`, label: `row-span-${i + 1}` })),
        { value: 'row-span-full', label: 'row-span-full' },
        { value: 'row-auto', label: 'row-auto' },
        // Grid flow
        { value: 'grid-flow-row', label: 'grid-flow-row' },
        { value: 'grid-flow-col', label: 'grid-flow-col' },
        { value: 'grid-flow-row-dense', label: 'grid-flow-row-dense' },
        { value: 'grid-flow-col-dense', label: 'grid-flow-col-dense' },
        // Auto columns/rows
        { value: 'auto-cols-auto', label: 'auto-cols-auto' },
        { value: 'auto-cols-fr', label: 'auto-cols-fr' },
        { value: 'auto-cols-max', label: 'auto-cols-max' },
        { value: 'auto-cols-min', label: 'auto-cols-min' },
        { value: 'auto-rows-auto', label: 'auto-rows-auto' },
        { value: 'auto-rows-fr', label: 'auto-rows-fr' },
        { value: 'auto-rows-max', label: 'auto-rows-max' },
        { value: 'auto-rows-min', label: 'auto-rows-min' }
      ]
    },
    {
      label: 'Height',
      classes: [
        ...['0', '1', '2', '3', '4', '5', '6', '8', '10', '12', '16', '20', '24', '32', '40', '48', '56', '64'].map(size => 
          ({ value: `h-${size}`, label: `h-${size}` })
        ),
        { value: 'h-auto', label: 'h-auto' },
        { value: 'h-px', label: 'h-px' },
        { value: 'h-full', label: 'h-full' },
        { value: 'h-screen', label: 'h-screen' },
        { value: 'h-1/2', label: 'h-1/2' },
        { value: 'h-1/3', label: 'h-1/3' },
        { value: 'h-2/3', label: 'h-2/3' },
        { value: 'h-1/4', label: 'h-1/4' },
        { value: 'h-2/4', label: 'h-2/4' },
        { value: 'h-3/4', label: 'h-3/4' },
        { value: 'h-1/5', label: 'h-1/5' },
        { value: 'h-2/5', label: 'h-2/5' },
        { value: 'h-3/5', label: 'h-3/5' },
        { value: 'h-4/5', label: 'h-4/5' },
        { value: 'h-1/6', label: 'h-1/6' },
        { value: 'h-2/6', label: 'h-2/6' },
        { value: 'h-3/6', label: 'h-3/6' },
        { value: 'h-4/6', label: 'h-4/6' },
        { value: 'h-5/6', label: 'h-5/6' },
        // Min height
        { value: 'min-h-0', label: 'min-h-0' },
        { value: 'min-h-full', label: 'min-h-full' },
        { value: 'min-h-screen', label: 'min-h-screen' },
        // Max height
        { value: 'max-h-full', label: 'max-h-full' },
        { value: 'max-h-screen', label: 'max-h-screen' },
        ...['0', '1', '2', '3', '4', '5', '6', '8', '10', '12', '16', '20', '24', '32', '40', '48', '56', '64'].map(size => 
          ({ value: `max-h-${size}`, label: `max-h-${size}` })
        ),
        { value: 'max-h-px', label: 'max-h-px' }
      ]
    },
    {
      label: 'List',
      classes: [
        { value: 'list-disc', label: 'list-disc' },
        { value: 'list-decimal', label: 'list-decimal' },
        { value: 'list-none', label: 'list-none' },
        { value: 'list-inside', label: 'list-inside' },
        { value: 'list-outside', label: 'list-outside' }
      ]
    },
    {
      label: 'Margins',
      classes: [
        ...generateSpacingClasses('m'),
        ...generateSpacingClasses('mt'),
        ...generateSpacingClasses('mr'),
        ...generateSpacingClasses('mb'),
        ...generateSpacingClasses('ml'),
        ...generateSpacingClasses('mx'),
        ...generateSpacingClasses('my'),
        // Negative margins
        ...['1', '2', '3', '4', '5', '6', '8', '10', '12', '16', '20', '24', '32', '40', '48', '56', '64', 'px'].flatMap(size => [
          { value: `-m-${size}`, label: `-m-${size}` },
          { value: `-mt-${size}`, label: `-mt-${size}` },
          { value: `-mr-${size}`, label: `-mr-${size}` },
          { value: `-mb-${size}`, label: `-mb-${size}` },
          { value: `-ml-${size}`, label: `-ml-${size}` },
          { value: `-mx-${size}`, label: `-mx-${size}` },
          { value: `-my-${size}`, label: `-my-${size}` }
        ])
      ]
    },
    {
      label: 'Paddings',
      classes: [
        ...generateSpacingClasses('p'),
        ...generateSpacingClasses('pt'),
        ...generateSpacingClasses('pr'),
        ...generateSpacingClasses('pb'),
        ...generateSpacingClasses('pl'),
        ...generateSpacingClasses('px'),
        ...generateSpacingClasses('py')
      ]
    },
    {
      label: 'Positioning',
      classes: [
        { value: 'static', label: 'static' },
        { value: 'relative', label: 'relative' },
        { value: 'absolute', label: 'absolute' },
        { value: 'fixed', label: 'fixed' },
        { value: 'sticky', label: 'sticky' },
        // Inset
        ...['0', '1', '2', '3', '4', '5', '6', '8', '10', '12', '16', '20', '24', '32', '40', '48', '56', '64', 'auto', 'px', 'full'].flatMap(size => [
          { value: `inset-${size}`, label: `inset-${size}` },
          { value: `inset-x-${size}`, label: `inset-x-${size}` },
          { value: `inset-y-${size}`, label: `inset-y-${size}` },
          { value: `top-${size}`, label: `top-${size}` },
          { value: `right-${size}`, label: `right-${size}` },
          { value: `bottom-${size}`, label: `bottom-${size}` },
          { value: `left-${size}`, label: `left-${size}` }
        ]),
        // Negative positioning
        ...['1', '2', '3', '4', '5', '6', '8', '10', '12', '16', '20', '24', '32', '40', '48', '56', '64', 'px', 'full'].flatMap(size => [
          { value: `-inset-${size}`, label: `-inset-${size}` },
          { value: `-inset-x-${size}`, label: `-inset-x-${size}` },
          { value: `-inset-y-${size}`, label: `-inset-y-${size}` },
          { value: `-top-${size}`, label: `-top-${size}` },
          { value: `-right-${size}`, label: `-right-${size}` },
          { value: `-bottom-${size}`, label: `-bottom-${size}` },
          { value: `-left-${size}`, label: `-left-${size}` }
        ]),
        // Z-index
        ...['0', '10', '20', '30', '40', '50', 'auto'].map(z => ({ value: `z-${z}`, label: `z-${z}` })),
        // Float
        { value: 'float-left', label: 'float-left' },
        { value: 'float-right', label: 'float-right' },
        { value: 'float-none', label: 'float-none' },
        // Clear
        { value: 'clear-left', label: 'clear-left' },
        { value: 'clear-right', label: 'clear-right' },
        { value: 'clear-both', label: 'clear-both' },
        { value: 'clear-none', label: 'clear-none' },
        // Object fit
        { value: 'object-contain', label: 'object-contain' },
        { value: 'object-cover', label: 'object-cover' },
        { value: 'object-fill', label: 'object-fill' },
        { value: 'object-none', label: 'object-none' },
        { value: 'object-scale-down', label: 'object-scale-down' },
        // Object position
        { value: 'object-bottom', label: 'object-bottom' },
        { value: 'object-center', label: 'object-center' },
        { value: 'object-left', label: 'object-left' },
        { value: 'object-left-bottom', label: 'object-left-bottom' },
        { value: 'object-left-top', label: 'object-left-top' },
        { value: 'object-right', label: 'object-right' },
        { value: 'object-right-bottom', label: 'object-right-bottom' },
        { value: 'object-right-top', label: 'object-right-top' },
        { value: 'object-top', label: 'object-top' }
      ]
    },
    {
      label: 'Sizing',
      classes: [
        // Width
        ...['0', '1', '2', '3', '4', '5', '6', '8', '10', '12', '16', '20', '24', '32', '40', '48', '56', '64'].map(size => 
          ({ value: `w-${size}`, label: `w-${size}` })
        ),
        { value: 'w-auto', label: 'w-auto' },
        { value: 'w-px', label: 'w-px' },
        { value: 'w-full', label: 'w-full' },
        { value: 'w-screen', label: 'w-screen' },
        { value: 'w-1/2', label: 'w-1/2' },
        { value: 'w-1/3', label: 'w-1/3' },
        { value: 'w-2/3', label: 'w-2/3' },
        { value: 'w-1/4', label: 'w-1/4' },
        { value: 'w-2/4', label: 'w-2/4' },
        { value: 'w-3/4', label: 'w-3/4' },
        { value: 'w-1/5', label: 'w-1/5' },
        { value: 'w-2/5', label: 'w-2/5' },
        { value: 'w-3/5', label: 'w-3/5' },
        { value: 'w-4/5', label: 'w-4/5' },
        { value: 'w-1/6', label: 'w-1/6' },
        { value: 'w-2/6', label: 'w-2/6' },
        { value: 'w-3/6', label: 'w-3/6' },
        { value: 'w-4/6', label: 'w-4/6' },
        { value: 'w-5/6', label: 'w-5/6' },
        { value: 'w-1/12', label: 'w-1/12' },
        { value: 'w-2/12', label: 'w-2/12' },
        { value: 'w-3/12', label: 'w-3/12' },
        { value: 'w-4/12', label: 'w-4/12' },
        { value: 'w-5/12', label: 'w-5/12' },
        { value: 'w-6/12', label: 'w-6/12' },
        { value: 'w-7/12', label: 'w-7/12' },
        { value: 'w-8/12', label: 'w-8/12' },
        { value: 'w-9/12', label: 'w-9/12' },
        { value: 'w-10/12', label: 'w-10/12' },
        { value: 'w-11/12', label: 'w-11/12' },
        // Min width
        { value: 'min-w-0', label: 'min-w-0' },
        { value: 'min-w-full', label: 'min-w-full' },
        { value: 'min-w-min', label: 'min-w-min' },
        { value: 'min-w-max', label: 'min-w-max' },
        // Max width
        { value: 'max-w-none', label: 'max-w-none' },
        { value: 'max-w-xs', label: 'max-w-xs' },
        { value: 'max-w-sm', label: 'max-w-sm' },
        { value: 'max-w-md', label: 'max-w-md' },
        { value: 'max-w-lg', label: 'max-w-lg' },
        { value: 'max-w-xl', label: 'max-w-xl' },
        { value: 'max-w-2xl', label: 'max-w-2xl' },
        { value: 'max-w-3xl', label: 'max-w-3xl' },
        { value: 'max-w-4xl', label: 'max-w-4xl' },
        { value: 'max-w-5xl', label: 'max-w-5xl' },
        { value: 'max-w-6xl', label: 'max-w-6xl' },
        { value: 'max-w-7xl', label: 'max-w-7xl' },
        { value: 'max-w-full', label: 'max-w-full' },
        { value: 'max-w-min', label: 'max-w-min' },
        { value: 'max-w-max', label: 'max-w-max' },
        { value: 'max-w-prose', label: 'max-w-prose' },
        { value: 'max-w-screen-sm', label: 'max-w-screen-sm' },
        { value: 'max-w-screen-md', label: 'max-w-screen-md' },
        { value: 'max-w-screen-lg', label: 'max-w-screen-lg' },
        { value: 'max-w-screen-xl', label: 'max-w-screen-xl' },
        { value: 'max-w-screen-2xl', label: 'max-w-screen-2xl' }
      ]
    },
    {
      label: 'Sizing',
      classes: [
        // Width
        { value: 'w-auto', label: 'w-auto' },
        { value: 'w-full', label: 'w-full' },
        { value: 'w-1/2', label: 'w-1/2' },
        { value: 'w-1/3', label: 'w-1/3' },
        { value: 'w-2/3', label: 'w-2/3' },
        { value: 'w-1/4', label: 'w-1/4' },
        { value: 'w-3/4', label: 'w-3/4' },
        { value: 'w-screen', label: 'w-screen' },
        // Height
        { value: 'h-auto', label: 'h-auto' },
        { value: 'h-full', label: 'h-full' },
        { value: 'h-screen', label: 'h-screen' },
        { value: 'h-32', label: 'h-32' },
        { value: 'h-64', label: 'h-64' },
        { value: 'min-h-screen', label: 'min-h-screen' },
        { value: 'max-w-sm', label: 'max-w-sm' },
        { value: 'max-w-md', label: 'max-w-md' },
        { value: 'max-w-lg', label: 'max-w-lg' },
        { value: 'max-w-xl', label: 'max-w-xl' }
      ]
    },
    {
      label: 'Typography',
      classes: [
        // Font size
        { value: 'text-xs', label: 'text-xs' },
        { value: 'text-sm', label: 'text-sm' },
        { value: 'text-base', label: 'text-base' },
        { value: 'text-lg', label: 'text-lg' },
        { value: 'text-xl', label: 'text-xl' },
        { value: 'text-2xl', label: 'text-2xl' },
        { value: 'text-3xl', label: 'text-3xl' },
        { value: 'text-4xl', label: 'text-4xl' },
        { value: 'text-5xl', label: 'text-5xl' },
        { value: 'text-6xl', label: 'text-6xl' },
        { value: 'text-7xl', label: 'text-7xl' },
        { value: 'text-8xl', label: 'text-8xl' },
        { value: 'text-9xl', label: 'text-9xl' },
        // Font weight
        { value: 'font-thin', label: 'font-thin' },
        { value: 'font-extralight', label: 'font-extralight' },
        { value: 'font-light', label: 'font-light' },
        { value: 'font-normal', label: 'font-normal' },
        { value: 'font-medium', label: 'font-medium' },
        { value: 'font-semibold', label: 'font-semibold' },
        { value: 'font-bold', label: 'font-bold' },
        { value: 'font-extrabold', label: 'font-extrabold' },
        { value: 'font-black', label: 'font-black' },
        // Font family
        { value: 'font-sans', label: 'font-sans' },
        { value: 'font-serif', label: 'font-serif' },
        { value: 'font-mono', label: 'font-mono' },
        // Text alignment
        { value: 'text-left', label: 'text-left' },
        { value: 'text-center', label: 'text-center' },
        { value: 'text-right', label: 'text-right' },
        { value: 'text-justify', label: 'text-justify' },
        // Text transform
        { value: 'uppercase', label: 'uppercase' },
        { value: 'lowercase', label: 'lowercase' },
        { value: 'capitalize', label: 'capitalize' },
        { value: 'normal-case', label: 'normal-case' },
        // Text decoration
        { value: 'underline', label: 'underline' },
        { value: 'line-through', label: 'line-through' },
        { value: 'no-underline', label: 'no-underline' },
        // Line height
        { value: 'leading-3', label: 'leading-3' },
        { value: 'leading-4', label: 'leading-4' },
        { value: 'leading-5', label: 'leading-5' },
        { value: 'leading-6', label: 'leading-6' },
        { value: 'leading-7', label: 'leading-7' },
        { value: 'leading-8', label: 'leading-8' },
        { value: 'leading-9', label: 'leading-9' },
        { value: 'leading-10', label: 'leading-10' },
        { value: 'leading-none', label: 'leading-none' },
        { value: 'leading-tight', label: 'leading-tight' },
        { value: 'leading-snug', label: 'leading-snug' },
        { value: 'leading-normal', label: 'leading-normal' },
        { value: 'leading-relaxed', label: 'leading-relaxed' },
        { value: 'leading-loose', label: 'leading-loose' },
        // Letter spacing
        { value: 'tracking-tighter', label: 'tracking-tighter' },
        { value: 'tracking-tight', label: 'tracking-tight' },
        { value: 'tracking-normal', label: 'tracking-normal' },
        { value: 'tracking-wide', label: 'tracking-wide' },
        { value: 'tracking-wider', label: 'tracking-wider' },
        { value: 'tracking-widest', label: 'tracking-widest' },
        // Text color
        ...generateColorClasses('text', colors),
        // Text opacity
        ...['0', '5', '10', '20', '25', '30', '40', '50', '60', '70', '75', '80', '90', '95', '100'].map(opacity => 
          ({ value: `text-opacity-${opacity}`, label: `text-opacity-${opacity}` })
        ),
        // Vertical alignment
        { value: 'align-baseline', label: 'align-baseline' },
        { value: 'align-top', label: 'align-top' },
        { value: 'align-middle', label: 'align-middle' },
        { value: 'align-bottom', label: 'align-bottom' },
        { value: 'align-text-top', label: 'align-text-top' },
        { value: 'align-text-bottom', label: 'align-text-bottom' },
        // Whitespace
        { value: 'whitespace-normal', label: 'whitespace-normal' },
        { value: 'whitespace-nowrap', label: 'whitespace-nowrap' },
        { value: 'whitespace-pre', label: 'whitespace-pre' },
        { value: 'whitespace-pre-line', label: 'whitespace-pre-line' },
        { value: 'whitespace-pre-wrap', label: 'whitespace-pre-wrap' },
        // Word break
        { value: 'break-normal', label: 'break-normal' },
        { value: 'break-words', label: 'break-words' },
        { value: 'break-all', label: 'break-all' },
        { value: 'truncate', label: 'truncate' }
      ]
    },
    {
      label: 'Colors',
      classes: [
        // Text colors
        { value: 'text-black', label: 'text-black' },
        { value: 'text-white', label: 'text-white' },
        { value: 'text-gray-500', label: 'text-gray-500' },
        { value: 'text-gray-700', label: 'text-gray-700' },
        { value: 'text-gray-900', label: 'text-gray-900' },
        { value: 'text-red-500', label: 'text-red-500' },
        { value: 'text-blue-500', label: 'text-blue-500' },
        { value: 'text-green-500', label: 'text-green-500' },
        // Background colors
        { value: 'bg-transparent', label: 'bg-transparent' },
        { value: 'bg-white', label: 'bg-white' },
        { value: 'bg-black', label: 'bg-black' },
        { value: 'bg-gray-100', label: 'bg-gray-100' },
        { value: 'bg-gray-200', label: 'bg-gray-200' },
        { value: 'bg-gray-500', label: 'bg-gray-500' },
        { value: 'bg-red-500', label: 'bg-red-500' },
        { value: 'bg-blue-500', label: 'bg-blue-500' },
        { value: 'bg-green-500', label: 'bg-green-500' }
      ]
    },
    {
      label: 'Borders',
      classes: [
        { value: 'border', label: 'border' },
        { value: 'border-0', label: 'border-0' },
        { value: 'border-2', label: 'border-2' },
        { value: 'border-4', label: 'border-4' },
        { value: 'border-t', label: 'border-t' },
        { value: 'border-r', label: 'border-r' },
        { value: 'border-b', label: 'border-b' },
        { value: 'border-l', label: 'border-l' },
        { value: 'border-solid', label: 'border-solid' },
        { value: 'border-dashed', label: 'border-dashed' },
        { value: 'border-dotted', label: 'border-dotted' },
        { value: 'border-gray-200', label: 'border-gray-200' },
        { value: 'border-gray-300', label: 'border-gray-300' },
        { value: 'rounded', label: 'rounded' },
        { value: 'rounded-sm', label: 'rounded-sm' },
        { value: 'rounded-md', label: 'rounded-md' },
        { value: 'rounded-lg', label: 'rounded-lg' },
        { value: 'rounded-xl', label: 'rounded-xl' },
        { value: 'rounded-full', label: 'rounded-full' }
      ]
    },
    {
      label: 'Effects',
      classes: [
        { value: 'shadow', label: 'shadow' },
        { value: 'shadow-sm', label: 'shadow-sm' },
        { value: 'shadow-md', label: 'shadow-md' },
        { value: 'shadow-lg', label: 'shadow-lg' },
        { value: 'shadow-xl', label: 'shadow-xl' },
        { value: 'shadow-none', label: 'shadow-none' },
        { value: 'opacity-0', label: 'opacity-0' },
        { value: 'opacity-25', label: 'opacity-25' },
        { value: 'opacity-50', label: 'opacity-50' },
        { value: 'opacity-75', label: 'opacity-75' },
        { value: 'opacity-100', label: 'opacity-100' }
      ]
    },
    {
      label: 'Transitions & Animation',
      classes: [
        { value: 'transition', label: 'transition' },
        { value: 'transition-all', label: 'transition-all' },
        { value: 'transition-colors', label: 'transition-colors' },
        { value: 'transition-opacity', label: 'transition-opacity' },
        { value: 'transition-transform', label: 'transition-transform' },
        { value: 'duration-75', label: 'duration-75' },
        { value: 'duration-100', label: 'duration-100' },
        { value: 'duration-150', label: 'duration-150' },
        { value: 'duration-200', label: 'duration-200' },
        { value: 'duration-300', label: 'duration-300' },
        { value: 'duration-500', label: 'duration-500' },
        { value: 'ease-in', label: 'ease-in' },
        { value: 'ease-out', label: 'ease-out' },
        { value: 'ease-in-out', label: 'ease-in-out' },
        { value: 'animate-spin', label: 'animate-spin' },
        { value: 'animate-ping', label: 'animate-ping' },
        { value: 'animate-pulse', label: 'animate-pulse' },
        { value: 'animate-bounce', label: 'animate-bounce' }
      ]
    },
    {
      label: 'Interactivity',
      classes: [
        { value: 'cursor-auto', label: 'cursor-auto' },
        { value: 'cursor-default', label: 'cursor-default' },
        { value: 'cursor-pointer', label: 'cursor-pointer' },
        { value: 'cursor-wait', label: 'cursor-wait' },
        { value: 'cursor-text', label: 'cursor-text' },
        { value: 'cursor-move', label: 'cursor-move' },
        { value: 'cursor-not-allowed', label: 'cursor-not-allowed' },
        { value: 'select-none', label: 'select-none' },
        { value: 'select-text', label: 'select-text' },
        { value: 'select-all', label: 'select-all' },
        { value: 'pointer-events-none', label: 'pointer-events-none' },
        { value: 'pointer-events-auto', label: 'pointer-events-auto' }
      ]
    }
  ]

  // Get all classes as flat array
  const getAllClasses = (): TailwindClass[] => {
    return classGroups.flatMap(group => group.classes)
  }

  // Get classes by group
  const getClassesByGroup = (groupLabel: string): TailwindClass[] => {
    const group = classGroups.find(g => g.label === groupLabel)
    return group ? group.classes : []
  }

  // Search classes
  const searchClasses = (query: string): TailwindClass[] => {
    const allClasses = getAllClasses()
    return allClasses.filter(cls => 
      cls.value.toLowerCase().includes(query.toLowerCase()) ||
      cls.label.toLowerCase().includes(query.toLowerCase())
    )
  }

  // Format for Nuxt UI Select
  const getFormattedGroups = () => {
    return classGroups.map(group => ({
      label: group.label,
      options: group.classes.map(cls => ({
        label: cls.label,
        value: cls.value,
        description: cls.description
      }))
    }))
  }

  // Format for Nuxt UI CommandPalette (groups with items)
  const getCommandPaletteGroups = () => {
    return classGroups.map(group => ({
      id: group.label.toLowerCase().replace(/\s+/g, '-'),
      label: group.label,
      items: group.classes.map(cls => ({
        id: cls.value,
        label: cls.value,
        suffix: cls.label,
        value: cls.value,
        description: cls.description
      }))
    }))
  }

  // Format all classes as flat array for CommandPalette
  const getFormattedClasses = () => {
    return getAllClasses().map(cls => ({
      id: cls.value,
      label: cls.value,
      suffix: cls.label,
      value: cls.value,
      description: cls.description
    }))
  }

  return {
    classGroups,
    getAllClasses,
    getClassesByGroup,
    searchClasses,
    getFormattedGroups,
    getCommandPaletteGroups,
    getFormattedClasses
  }
}