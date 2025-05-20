// Helper to create mongoose-like validation error
export default function validationError({ kind, message, path, value }) {
  let err = new Error(message)
  err.errors = {
    [path]: {
      kind,
      message,
      name: 'ValidatorError',
      path,
      value
    }
  }
  return err
}
