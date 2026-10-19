export class ApiError extends Error {
  constructor(status, code, message, requestId) {
    super(message)
    this.status = status
    this.code = code
    this.requestId = requestId
  }
  get notReady() {
    return this.status === 409 || this.code === 'RESULT_NOT_READY'
  }
}
