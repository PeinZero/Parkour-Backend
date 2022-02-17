// TODO:
// add a helper function to check if the user is a parker


export const checkIfObjectDoesNotExists = (object, errorMessage) => {
  if (!object) {
    const error = new Error(errorMessage);
    error.statusCode = 404;
    throw error;
  }
};

export const checkIfObjectExists = (object, errorMessage) => { // checking for duplicate objects
  if (object) {
    const error = new Error(errorMessage);
    error.statusCode = 409;
    throw error;
  }
}

export const throwError = (errorMessage, statusCode) =>  {
  const error = new Error(errorMessage);
  error.statusCode = statusCode;
  throw error;
}
