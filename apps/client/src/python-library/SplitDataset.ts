export const SplitDataset = (dataset: string, dataTrain: string, dataDev: string, 
                             dataTest: string, trainSplit: number, devSplit: number) => {
    return `_X, _Y = ${dataset}\n` +
        '_n = len(_X)\n' +
        '_indices = torch.randperm(_n)\n' +
        '_X, _Y = _X[_indices], _Y[_indices]\n' +
        '\n' +
        `_n1, _n2 = int(${trainSplit}*_n), int((${trainSplit} + ${devSplit})*_n)\n` +
        `${dataTrain} = (_X[:_n1], _Y[:_n1])\n` +
        `${dataDev} = (_X[_n1:_n2], _Y[_n1:_n2])\n` +
        `${dataTest} = (_X[_n2:], _Y[_n2:])\n\n`
};