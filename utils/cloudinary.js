import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: "dlnf3nxvi",
  api_key: "925451736273961",
  api_secret: "jb6e4j6wigEjoiR88AK-YS0xnW8",
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null
    //upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto"
    })
    // file has been uploaded successfull
    fs.unlinkSync(localFilePath) 
    console.log("file is uploaded on cloudinary ", response.url);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
    return null;
  }
};

export { uploadOnCloudinary };
