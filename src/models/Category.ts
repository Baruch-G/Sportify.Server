import mongoose,{Schema,Document} from "mongoose";
import { v4 as uuidv4 } from "uuid";

export interface ICategory extends Document {
    id: string; 
    name: string; 
    description: string; 
    imageURL: string; 
  }


const CategorySchema: Schema=new Schema({

    id:{type:String,default:uuidv4},
    name: {type:String,required:true},
    description: {type:String,required:true},
    imageURL: {type:URL,required:true}

})

export const CategoryModel = mongoose.model<ICategory>("Category", CategorySchema);
