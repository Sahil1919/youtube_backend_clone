

class ApiSuccess {
    constructor(data, message = "Success") {
        // this.statusCode = statusCode
        this.data = data,
        this.message = message,
        this.success = 200
    }
}

export default ApiSuccess