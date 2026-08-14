// Shared field styling — matches DESIGN.md §5 Inputs (1px slate-line border,
// 6px radius, 36px tall, 4px 12px padding) via the h-field/rounded-field/
// px-field-x/py-field-y tokens already defined in src/index.css.
export const inputBase = 'w-full h-field px-field-x py-field-y text-sm rounded-field bg-white dark:bg-white/5 border outline-none text-slate-900 dark:text-white transition-all duration-200'
export const textareaBase = inputBase.replace('h-field', 'min-h-field')
export const inputNormal = 'border-slate-200 dark:border-white/10 focus:border-blue-400/50'
export const inputError = 'border-red-400/50 dark:border-red-400/30 focus:border-red-400'
