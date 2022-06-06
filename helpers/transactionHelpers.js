import { throwError } from './helperfunctions';

export const isCreditSufficient = (user, credit) => {
  if (user.credit < credit) {
    return false;
  }
  return true;
};

export const deductCredit = (user, credit) => {
  if (isCreditSufficient(user, credit)) {
    user.credit = user.credit - credit;
    return user;
  } else {
    throwError('Insufficient Credit', 403);
  }
};

export const penalizeCredit = (user, credit) => {
  user.credit = user.credit - credit;
  return user;
};
