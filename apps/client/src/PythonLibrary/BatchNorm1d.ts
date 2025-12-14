export const BatchNorm1d = 
    "class BatchNorm1d:\n" +
    "    def __init__(self, dim, eps=1e-5, momentum=0.1):\n" +
    "        self.eps = eps\n" +
    "        self.momentum = momentum\n" +
    "        self.training = True\n" +
    "        self.gamma = torch.ones(dim)\n" +
    "        self.beta = torch.zeros(dim)\n" +
    "        self.running_mean = torch.zeros(dim)\n" +
    "        self.running_var = torch.ones(dim)\n" +
    "\n" +
    "    def __call__(self, x):\n" +
    "        if self.training:\n" +
    "            self.xmean = x.mean(0, keepdim=True)\n" +
    "            self.xvar = x.var(0, keepdim=True)\n" +
    "        else:\n" +
    "            self.xmean = self.running_mean\n" +
    "            self.xvar = self.running_var\n" +
    "\n" +
    "        xhat = (x - self.xmean) / torch.sqrt(self.xvar + self.eps)\n" +
    "        self.out = self.gamma * xhat + self.beta\n" +
    "\n" +
    "        if self.training:\n" +
    "            with torch.no_grad():\n" +
    "                self.running_mean = (1 - self.momentum) * self.running_mean + self.momentum * self.xmean\n" +
    "                self.running_var = (1 - self.momentum) * self.running_var + self.momentum * self.xvar\n" +
    "        return self.out\n"