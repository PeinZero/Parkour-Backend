// TODO:
// add a helper function to check if the user is a parker
// TODO:

export const checkIfObjectDoesNotExists = (object, errorMessage) => {
  if (!object) {
    const error = new Error(errorMessage);
    error.statusCode = 404;
    throw error;
  }
};

export const checkIfObjectExists = (object, errorMessage) => {
  if (object) {
    const error = new Error(errorMessage);
    error.statusCode = 409;
    throw error;
  }
}
