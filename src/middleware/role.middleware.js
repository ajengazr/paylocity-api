function authorize(...roles) {
    
    return (req, res, next) => {
        
        if (!req.user) {
            console.log("ini req user: ", req.user);
            return res.status(401).json({
                success: false,
                errors: "Belum terverifikasi"
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                errors: "Akses ditolak"
            });
        }

        next();
    };
}

export { authorize };