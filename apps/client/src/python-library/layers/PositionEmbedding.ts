export const PositionEmbedding = `class PositionSource(nn.Module):
    def __init__(self, context_len, embedding_dim):
        super().__init__()
        self.embedding = nn.Embedding(context_len, embedding_dim)
        self.register_buffer('pos_idxs', torch.arange(context_len))

    def forward(self, x):
        _batch_size, _context_len = x.shape
        return self.embedding(self.pos_idxs[:_context_len])`