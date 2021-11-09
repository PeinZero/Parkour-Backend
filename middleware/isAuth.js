exports.isAuth = (req, res, next) => {
    const authHeader = req.get("Authorization");
    
    if (!authHeader) {
        return res.status(422).json({ message: 'not authenticated' });
    }
    
    const token = authHeader.split(' ')[1];
    let decodedToken; 
    
    try {
        decodedToken = jwt.verify(token, 'secret');
    } 
    catch (err) {
        return res.status(500).json({ message: err.message || 'could not decode the token' });
    }
    
    if (!decodedToken) {
        res.status(422).json({ message: 'unauthorized' });
    } else {
        res.status(200).json({ message: 'here is your resource' });
    }

    next();
}