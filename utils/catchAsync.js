module.exports = func => {
    return (req, res, next) => {
        func(req, res, next).catch(err => {
            console.error(err);
            next(err);
        })
    }
}