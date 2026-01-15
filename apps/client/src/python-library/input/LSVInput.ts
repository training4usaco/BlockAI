export const LSVInput = (varname: string, filename: string) => {
    return `${varname} = open('${filename}', 'r').read().splitlines()\n`
}