import slugify from 'slugify';
import categoryModel from '../../../DB/models/category.model.js'

export const create = async (req, res) => {
  const { name } = req.body;
  const slug = slugify(name);
  const userId = req.id;           
  const category = await categoryModel.create({name,slug,createdBy:userId,updatedBy:userId})
  return res.status(201).json({message:"success",category});

  //return res.json(req.id);
};
 
export const get =async (req,res)=>{
  const categories = await categoryModel.find({});
  return res.status(200).json({message:"success",categories});
  
};