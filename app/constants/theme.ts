// Centralized theme-related constants and types

export type Shade = '50'|'100'|'200'|'300'|'400'|'500'|'600'|'700'|'800'|'900'|'950';
export const SHADES: Shade[] = ['50','100','200','300','400','500','600','700','800','900','950'];

export type ThemeVariable = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error';
export const THEME_VARIABLES: ThemeVariable[] = ['primary','secondary','success','info','warning','error'];

export type SizeKey = 'xs'|'sm'|'md'|'lg'|'xl';
export const SIZES: SizeKey[] = ['xs','sm','md','lg','xl'];

export type PropertyType = 'variants' | 'colors' | 'sizes';
