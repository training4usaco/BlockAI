export const TrainingLoop = (
    steps: string,
    batchSize: string,
    lrMax: string,
    paramsVar: string,
    modelVar: string,
    embTable: string,
    trainingData: string,
    blockSize: string,
    embDim: string
) => {
    return `print(f"Starting training for ${steps} steps...")
xtr, ytr = ${trainingData}
for i in range(${steps}):
    lr = ${lrMax} * 0.5 * (1.0 + math.cos(math.pi * i / ${steps}))
    idx = torch.randint(0, xtr.shape[0], (${batchSize},))
    xb, yb = xtr[idx], ytr[idx]

    emb = ${embTable}[xb]
    x = emb.view(-1, ${embDim} * ${blockSize})
    
    for layer in ${modelVar}:
        x = layer(x)
    
    loss = F.cross_entropy(x, yb)

    for p in ${paramsVar}:
        p.grad = None
    loss.backward()

    for p in ${paramsVar}:
        p.data += -lr * p.grad

    if i % 1000 == 0:
        print(f'{i:7d}/${steps}: {loss.item():.4f} (lr={lr:.4f})')
        
for layer in ${modelVar}:
    layer.training = False
`;
};