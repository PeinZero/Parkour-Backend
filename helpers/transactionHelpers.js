import { throwError } from './helperfunctions.js';

function isCreditSufficient(user, credit) {
  if (user.credit < credit) {
    return false;
  }
  return true;
}

function deductCredit(user, credit) {
  if (isCreditSufficient(user, credit)) {
    user.credit = user.credit - credit;
    return user;
  } else {
    throwError('Insufficient Credit', 403);
  }
}

function penalizeCredit(user, credit) {
  user.credit = user.credit - credit;
  return user;
}

export default { isCreditSufficient, deductCredit, penalizeCredit };
