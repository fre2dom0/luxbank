//return path of src

const srcPath = () => {
    let dir = __dirname.split(`\\`)
    dir.pop()
    dir = dir.join("/")
    return dir
}

module.exports = srcPath