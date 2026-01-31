export const CharTokenizer = `
class CharTokenizer:
    def __init__(self, data):
        self.data = data
  
        # Find all unique characters
        data_chars = sorted(list(set("".join(data))))

        self.eos_token = '<STOP>'

        self.vocab_list = [self.eos_token] + data_chars

        self.stoi = {s: i for i, s in enumerate(self.vocab_list)}
        self.itos = {i: s for s, i in self.stoi.items()}

        self.vocab_size = len(self.vocab_list)

    def encode(self, word):
        return [self.stoi[c] for c in word] + [self.stoi[self.eos_token]]

    def decode(self, tokens):
        decoded_list = []
        for i in tokens:
            decoded_list.append(self.itos[i])
        return "".join(decoded_list)

    def export_dataset(self, block_size):
        xs, ys = [], []
        for w in self.data:
            encoded = self.encode(w)
            # Create sliding window
            context = [self.stoi[self.eos_token]] * block_size
            for idx in encoded:
                xs.append(context)
                ys.append(idx)
                context = context[1:] + [idx]
        return torch.tensor(xs), torch.tensor(ys)`;