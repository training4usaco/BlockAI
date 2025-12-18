export const CharTokenizer =
    'class CharTokenizer:\n' +
    '  def __init__(self, data):\n' +
    '    # Find all unique characters\n' +
    '    chars = sorted(list(set("".join(data))))\n' +
    '    self.stoi = {s:i+1 for i,s in enumerate(chars)}\n' +
    '    self.stoi["."] = 0\n' +
    '    self.itos = {i:s for s,i in self.stoi.items()}\n' +
    '    self.vocab_size = len(self.itos)\n' +
    '    self.data = data\n' +
    '\n' +
    '  def encode(self, word):\n' +
    '    return [self.stoi[c] for c in word + "."]\n' +
    '\n' +
    '  def decode(self, tokens):\n' +
    '    return "".join([self.itos[i] for i in tokens])\n' +
    '\n' +
    '  def export_dataset(self, block_size):\n' +
    '    xs, ys = [], []\n' +
    '    for w in self.data:\n' +
    '      encoded = self.encode(w)\n' +
    '      # Create sliding window\n' +
    '      context = [0] * block_size\n' +
    '      for idx in encoded:\n' +
    '        xs.append(context)\n' +
    '        ys.append(idx)\n' +
    '        context = context[1:] + [idx]\n' +
    '    return torch.tensor(xs), torch.tensor(ys)\n'