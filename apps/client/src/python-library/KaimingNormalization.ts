export const KaimingNormalization = (linearClass: string, scale: string, 
                                     modelName: string, activationChecks: string) => {
    return `with torch.no_grad():
    ${modelName}[-1].weight *= ${scale}
    for i, layer in enumerate(${modelName}[:-1]):
        if isinstance(layer, ${linearClass}):
            gain = 1.0
            for next_layer in ${modelName}[i+1:]:
                if isinstance(next_layer, ${linearClass}):
                    break
${activationChecks}            
            layer.weight *= gain\n\n`;
}; 