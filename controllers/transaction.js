export const createWallet = async (req, res, next) => {
  console.log('createWallet');
  const user = req.user;
  res.status(200).json({ user, message: 'Wallet Created' });
};

export const getCredit = async (req, res) => {
  console.log('getCredit');
  const user = req.user;
  const credit = user.credit;
  res.status(200).json({ credit, message: 'Credit Retrieved' });
};

export const addCredit = async (req, res) => {
  console.log('addCredit');

  const user = req.user;
  const { credit } = req.body;
  user.credit = user.credit + credit;
  await user.save();

  res.status(200).json({ user, message: 'Credit Added' });
};
