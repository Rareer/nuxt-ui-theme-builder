#!/usr/bin/env node
/**
 * Generate Tailwind v4 safelist using `@source inline`.
 * This enumerates a wide set of utilities to ensure dynamically-entered classes
 * render at runtime, even if they don't appear at compile-time.
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const shades = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];
const colors = [
	'transparent', 'current', 'black', 'white',
	'slate', 'gray', 'zinc', 'neutral', 'stone',
	'red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan',
	'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose',
];
const spacing = ['0', '1', '2', '3', '4', '5', '6', '8', '10', '12', '16', '20', '24', '32', '40', '48', '56', '64', 'px', 'auto'];
const variants = ['hover', 'focus', 'active'];
const screens = ['sm', 'md', 'lg', 'xl'];

// Helpers to compose brace groups in Tailwind v4 inline patterns
const group = (items, suffix = ':') => '{' + items.map(i => `${i}${suffix}`).join(',') + ',}';
const list = items => '{' + items.join(',') + '}';

// Build pattern lines using brace expansion syntax recommended for Tailwind v4
const patternLines = () => {
	const lines = [];
	const variantGroup = group(variants);
	const screenGroup = group(screens);

	// Colors with shades for palette colors
	const palette = colors.filter(c => !['transparent', 'current', 'black', 'white'].includes(c));
	const palettesList = list(palette);
	const shadesList = '{50,{100..900..100},950}';
	const colorPrefixes = list(['bg', 'text', 'border']);
	lines.push(`@source inline('${variantGroup}${screenGroup}${colorPrefixes}-${palettesList}-${shadesList}');`);

	// Base colors without shades
	const baseColorsList = list(['transparent', 'current', 'black', 'white']);
	lines.push(`@source inline('${variantGroup}${screenGroup}${colorPrefixes}-${baseColorsList}');`);

	// Gradient directions and color stops
	lines.push(`@source inline('bg-gradient-to-{b,bl,br,l,r,t,tl,tr}');`);
	lines.push(`@source inline('{from,via,to}-${palettesList}-${shadesList}');`);
	lines.push(`@source inline('{from,via,to}-${baseColorsList}');`);

	// Grid columns/rows and spans with responsive variants
	lines.push(`@source inline('${screenGroup}grid-cols-{1..12}');`);
	lines.push(`@source inline('${screenGroup}grid-rows-{1..6}');`);
	lines.push(`@source inline('${screenGroup}col-span-{1..12}');`);
	lines.push(`@source inline('${screenGroup}row-span-{1..6}');`);
	lines.push(`@source inline('${screenGroup}{grid-cols-none,grid-rows-none,col-span-full,col-auto,row-span-full,row-auto,grid-flow-{row,col,row-dense,col-dense},auto-cols-{auto,fr,max,min},auto-rows-{auto,fr,max,min}}');`);

	// Gaps
	const spacingList = list(spacing);
	lines.push(`@source inline('${screenGroup}gap-${spacingList}');`);
	lines.push(`@source inline('${screenGroup}gap-{x,y}-${spacingList}');`);

	// Spacing: padding and margin (base and axis variants)
	lines.push(`@source inline('${screenGroup}p-${spacingList}');`);
	lines.push(`@source inline('${screenGroup}p{x,y,t,r,b,l}-${spacingList}');`);
	lines.push(`@source inline('${screenGroup}m-${spacingList}');`);
	lines.push(`@source inline('${screenGroup}m{x,y,t,r,b,l}-${spacingList}');`);
	// Negative margins (no auto)
	const negSpacingList = list(spacing.filter(s => s !== 'auto'));
	lines.push(`@source inline('${screenGroup}-m-${negSpacingList}');`);
	lines.push(`@source inline('${screenGroup}-m{x,y,t,r,b,l}-${negSpacingList}');`);

	// Typography font sizes and alignment, weights, case, decoration
	lines.push(`@source inline('text-{xs,sm,base,lg,xl,2xl,3xl,4xl,5xl,6xl,7xl,8xl,9xl}');`);
	lines.push(`@source inline('font-{thin,extralight,light,normal,medium,semibold,bold,extrabold,black}');`);
	lines.push(`@source inline('font-{sans,serif,mono}');`);
	lines.push(`@source inline('text-{left,center,right,justify}');`);
	lines.push(`@source inline('{uppercase,lowercase,capitalize,normal-case}');`);
	lines.push(`@source inline('{underline,line-through,no-underline}');`);

	// Shadows, borders, radius
	lines.push(`@source inline('shadow{,-sm,-md,-lg,-xl,-none}');`);
	lines.push(`@source inline('{border,border-{0,2,4,8},border-{t,r,b,l},border-{solid,dashed,dotted,double,none}}');`);
	lines.push(`@source inline('rounded{,-none,-sm,-md,-lg,-xl,-2xl,-3xl,-full}');`);
	lines.push(`@source inline('rounded-{t,r,b,l,tl,tr,br,bl}-{sm,md,lg,xl,2xl,3xl,full}');`);

	// Display / Flex / Grid basics
	lines.push(`@source inline('{block,hidden,inline,inline-block,inline-flex,inline-grid,flex,grid,flow-root,contents}');`);
	lines.push(`@source inline('table{,-caption,-cell,-column,-column-group,-footer-group,-header-group,-row,-row-group}');`);
	lines.push(`@source inline('flex-{row,col,wrap,nowrap}');`);
	lines.push(`@source inline('justify-{start,center,end,between,around}');`);
	lines.push(`@source inline('items-{start,center,end,stretch}');`);

	// Transitions and animations
	lines.push(`@source inline('ease-{linear,in,out,in-out}');`);
	lines.push(`@source inline('duration-{75,100,150,200,300,500,700,1000}');`);
	lines.push(`@source inline('delay-{75,100,150,200,300,500,700,1000}');`);
	lines.push(`@source inline('transition{,-all,-colors,-opacity,-shadow,-transform}');`);
	lines.push(`@source inline('animate-{bounce,none,ping,pulse,spin}');`);

	// Interactivity
	lines.push(`@source inline('cursor-{auto,default,pointer,wait,text,move,not-allowed}');`);
	lines.push(`@source inline('select-{none,text,all}');`);
	lines.push(`@source inline('pointer-events-{none,auto}');`);

	return lines;
};

function opacitySet() {
	return [
		...['0', '25', '50', '75', '100'].map(v => `bg-opacity-${v}`),
		...['0', '5', '10', '20', '25', '30', '40', '50', '60', '70', '75', '80', '90', '95', '100'].map(v => `text-opacity-${v}`),
		...['0', '25', '50', '75', '100'].map(v => `border-opacity-${v}`),
		...['0', '25', '50', '75', '100'].map(v => `opacity-${v}`),
	];
}

function borderSet() {
	const out = [
		'border', 'border-0', 'border-2', 'border-4', 'border-8',
		'border-t', 'border-r', 'border-b', 'border-l',
		'border-solid', 'border-dashed', 'border-dotted', 'border-double', 'border-none',
		'rounded', 'rounded-none', 'rounded-sm', 'rounded-md', 'rounded-lg', 'rounded-xl', 'rounded-2xl', 'rounded-3xl', 'rounded-full',
	];
	const sides = ['t', 'r', 'b', 'l', 'tl', 'tr', 'br', 'bl'];
	const radii = ['sm', 'md', 'lg', 'xl', '2xl', '3xl', 'full'];
	for (const s of sides) for (const r of radii) out.push(`rounded-${s}-${r}`);
	return [...out, ...colorSet(['border'])];
}

function shadowSet() {
	return ['shadow', 'shadow-sm', 'shadow-md', 'shadow-lg', 'shadow-xl', 'shadow-none'];
}

function displayFlexGridSet() {
	return [
		'block', 'hidden', 'inline', 'inline-block', 'inline-flex', 'inline-grid', 'flex', 'grid', 'flow-root', 'contents',
		'table', 'table-caption', 'table-cell', 'table-column', 'table-column-group', 'table-footer-group', 'table-header-group', 'table-row', 'table-row-group',
		'flex-row', 'flex-col', 'flex-wrap', 'flex-nowrap',
		'justify-start', 'justify-center', 'justify-end', 'justify-between', 'justify-around',
		'items-start', 'items-center', 'items-end', 'items-stretch',
	];
}

function gapSet() {
	const out = [];
	out.push('gap');
	for (const s of spacing) out.push(`gap-${s}`);
	for (const s of spacing) out.push(`gap-x-${s}`, `gap-y-${s}`);
	return out;
}

function gridSet() {
	const out = [];
	for (let i = 1; i <= 12; i++) out.push(`grid-cols-${i}`);
	out.push('grid-cols-none');
	for (let i = 1; i <= 6; i++) out.push(`grid-rows-${i}`);
	out.push('grid-rows-none');
	for (let i = 1; i <= 12; i++) out.push(`col-span-${i}`);
	out.push('col-span-full', 'col-auto');
	for (let i = 1; i <= 6; i++) out.push(`row-span-${i}`);
	out.push('row-span-full', 'row-auto');
	out.push('grid-flow-row', 'grid-flow-col', 'grid-flow-row-dense', 'grid-flow-col-dense');
	out.push('auto-cols-auto', 'auto-cols-fr', 'auto-cols-max', 'auto-cols-min');
	out.push('auto-rows-auto', 'auto-rows-fr', 'auto-rows-max', 'auto-rows-min');
	return out;
}

function spacingSet() {
	const out = [];
	const axes = ['', 't', 'r', 'b', 'l', 'x', 'y'];
	for (const a of axes) for (const s of spacing) out.push(`m${a ? '-' + a : ''}-${s}`);
	for (const a of axes) for (const s of spacing) out.push(`p${a ? '-' + a : ''}-${s}`);
	// negatives (except auto)
	const neg = spacing.filter(s => s !== 'auto');
	for (const a of axes) for (const s of neg) out.push(`-m${a ? '-' + a : ''}-${s}`);
	return out;
}

function positionSet() {
	const out = ['static', 'relative', 'absolute', 'fixed', 'sticky'];
	const keys = ['inset', 'inset-x', 'inset-y', 'top', 'right', 'bottom', 'left'];
	for (const k of keys) for (const s of [...spacing, 'full']) out.push(`${k}-${s}`);
	const neg = spacing.filter(s => s !== 'auto');
	for (const k of keys) for (const s of [...neg, 'full']) out.push(`-${k}-${s}`);
	out.push('z-0', 'z-10', 'z-20', 'z-30', 'z-40', 'z-50', 'z-auto');
	return out;
}

function sizingSet() {
	const out = [];
	const fractions = [];
	for (let num = 1; num <= 12; num++) for (let den = 1; den <= 12; den++) fractions.push(`${num}/${den}`);
	for (const v of ['auto', 'px', 'full', 'screen', ...spacing, ...fractions]) out.push(`w-${v}`);
	for (const v of ['auto', 'px', 'full', 'screen', ...spacing, ...fractions]) out.push(`h-${v}`);
	out.push('min-w-0', 'min-w-full', 'min-w-min', 'min-w-max');
	out.push('max-w-none', 'max-w-xs', 'max-w-sm', 'max-w-md', 'max-w-lg', 'max-w-xl', 'max-w-2xl', 'max-w-3xl', 'max-w-4xl', 'max-w-5xl', 'max-w-6xl', 'max-w-7xl', 'max-w-full', 'max-w-min', 'max-w-max', 'max-w-prose', 'max-w-screen-sm', 'max-w-screen-md', 'max-w-screen-lg', 'max-w-screen-xl', 'max-w-screen-2xl');
	out.push('min-h-0', 'min-h-full', 'min-h-screen');
	out.push('max-h-full', 'max-h-screen', ...spacing.map(s => `max-h-${s}`), 'max-h-px');
	return out;
}

function typographySet() {
	const out = [
		'text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl', 'text-4xl', 'text-5xl', 'text-6xl', 'text-7xl', 'text-8xl', 'text-9xl',
		'font-thin', 'font-extralight', 'font-light', 'font-normal', 'font-medium', 'font-semibold', 'font-bold', 'font-extrabold', 'font-black',
		'font-sans', 'font-serif', 'font-mono',
		'text-left', 'text-center', 'text-right', 'text-justify',
		'uppercase', 'lowercase', 'capitalize', 'normal-case',
		'underline', 'line-through', 'no-underline',
		'leading-3', 'leading-4', 'leading-5', 'leading-6', 'leading-7', 'leading-8', 'leading-9', 'leading-10', 'leading-none', 'leading-tight', 'leading-snug', 'leading-normal', 'leading-relaxed', 'leading-loose',
		'tracking-tighter', 'tracking-tight', 'tracking-normal', 'tracking-wide', 'tracking-wider', 'tracking-widest',
	];
	return [...out, ...colorSet(['text'])];
}

function interactivitySet() {
	return ['cursor-auto', 'cursor-default', 'cursor-pointer', 'cursor-wait', 'cursor-text', 'cursor-move', 'cursor-not-allowed', 'select-none', 'select-text', 'select-all', 'pointer-events-none', 'pointer-events-auto'];
}

function transitionAnimSet() {
	return [
		'ease-linear', 'ease-in', 'ease-out', 'ease-in-out',
		'duration-75', 'duration-100', 'duration-150', 'duration-200', 'duration-300', 'duration-500', 'duration-700', 'duration-1000',
		'delay-75', 'delay-100', 'delay-150', 'delay-200', 'delay-300', 'delay-500', 'delay-700', 'delay-1000',
		'transition', 'transition-all', 'transition-colors', 'transition-opacity', 'transition-shadow', 'transition-transform',
		'animate-bounce', 'animate-none', 'animate-ping', 'animate-pulse', 'animate-spin',
	];
}

const lines = patternLines();
const content = lines.join('\n') + '\n';

const outPath = resolve('app/assets/css/safelist.css');
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, content);
