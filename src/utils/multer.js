import multer from 'multer'

export const fileValidation ={
    image :['image/png','image/jpeg','image/webp'],
    pdf:['application/pdf'],
    excel:['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
}

function fileUpload(customValidation = []){
    const storage = multer.diskStorage({});
    function fileFilter(req,file,cd){
        if(customValidation.includes(file.mimetype)){
           cb(null,true); 
        }else{
            cb("invalid format",false);
        }
    }
    const upload = multer({storage});
    return upload;
}

export default fileUpload;