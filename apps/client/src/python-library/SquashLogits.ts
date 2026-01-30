export const SquashLogits = (modelName: string, scale: string) => {
    return `${modelName}.layers[-1].weight *= ${scale}\n`
}