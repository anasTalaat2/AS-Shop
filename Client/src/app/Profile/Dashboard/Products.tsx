'use client'
import { useStatusContext } from "@/Utils/Status/statusContext";
import { useEffect, useState } from "react";
import { SkewLoader } from 'react-spinners';
import { ADD_PRODUCT, DELETE_PRODUCT, GET_PRODUCTS, SHOW_IMG, UPDATE_PRODUCT } from "@/Utils/Apis";
import axios from "axios";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { config } from "@/Utils/Auth/handleAuth";
import { CategoryData, getCategories } from "@/Utils/Products/getCategories";
import confirmation from "@/Utils/Status/confirmation";
import { handleMsg } from "@/Utils/Status/handleStatusMsg";

const Products = () => {
    const {isLoading, setIsLoading, successMsg, setSuccessMsg, err, setErr} = useStatusContext();

    interface ProductData{
        _id?: string;
        title: string;
        description: string;
        price: string;
        discountPercentage: string;
        brand: string;
        category: string;
        thumbnail?: string;
        images?: [string];
    }

    const [categories, setCategories] = useState<CategoryData[]> ();
    const [productData, setProductData] = useState<ProductData> ({
        title: '',
        description: '',
        price: '',
        discountPercentage: '',
        brand: '',
        category: 'Laptops'
    });

    const [updateMode, setUpdateMode] = useState<boolean> (false);
    const [productId, setProductId] = useState<any> (null);
    const [products, setProducts] = useState<ProductData[]> ();
    const [images, setImages] = useState<File[] | undefined>(undefined);
    const [thumbnail, setThumbnail] = useState<File | undefined>(undefined);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const thumbnail = event.target.files?.[0];
        setThumbnail(thumbnail);
    };


    const getProducts = async() => {
        try{
            const res = await axios.get(GET_PRODUCTS, config);
            const data = res.data.data;
            setProducts(data);
        }catch(err){
            console.log(err)
        }
    }
    
    useEffect(() => {
        handleMsg(undefined, successMsg, setSuccessMsg, err, setErr);
        setIsLoading(true);
        getCategories().then((data) => {setCategories(data); setIsLoading(false)});
        getProducts();
    }, [successMsg, err, setSuccessMsg, setErr, setIsLoading]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const {name, value} = e.target;
        setProductData({...productData, [name]: value});
    }

    const handleSubmit = async (e: React.MouseEvent, url: string) => {
        e.preventDefault();
        setIsLoading(true);
        try{            
            const formData = new FormData();
            formData.append('title', productData.title);
            formData.append('description', productData.description);
            formData.append('price', productData.price);
            formData.append('discountPercentage', productData.discountPercentage);
            formData.append('brand', productData.brand);
            formData.append('category', productData.category);

            if(updateMode){
                if(thumbnail){
                    formData.append('thumbnail', thumbnail);
                }
                if (images) {
                    for(let i = 0; i < images.length; i++){
                        formData.append('images', images[i]);
                    }
                }
                await axios.put(url, formData, config).then((data) => setSuccessMsg(data.data.message));
                setUpdateMode(false);
                setProductId(null);
            }else{
                if(!images || !thumbnail){
                    setErr('Images and thumbnail are required');
                    return;
                }
                if(thumbnail){
                    formData.append('thumbnail', thumbnail);
                }
                if (images) {
                    for(let i = 0; i < images.length; i++){
                        formData.append('images', images[i]);
                    }
                }
                await axios.post(url, formData, config).then((data) => setSuccessMsg(data.data.message));
            }
            setProductData({
                title: '',
                description: '',
                price: '',
                discountPercentage: '',
                brand: '',
                category: 'Laptops'
            });
            setThumbnail(undefined);
            setImages(undefined);
            setErr(null);
            getProducts();
        }catch(err: any){
            setErr(err.response?.data.message);
            console.log(err);
        }finally{
            setIsLoading(false);
        }
    }

    const handleUpdate = async (id: any) => {
        setUpdateMode(true)
        scrollTo(0, 0);
        const findProduct = products?.find((product) => product._id === id);
        if(findProduct){
            setProductData({
                title: findProduct.title,
                description: findProduct.description,
                price: findProduct.price,
                discountPercentage: findProduct.discountPercentage,
                brand: findProduct.brand,
                category: findProduct.category
            })
            setProductId(id)
        }
    }

    const handleDelete = async (id: any) => {
        confirmation({ url: DELETE_PRODUCT + id, config, successMsg: null, setSuccessMsg: () => setSuccessMsg(null), func: getProducts });
    }

    const showThumbnail = ( thumbnail &&
        <div className='flex items-start flex-col gap-2'>
            <span className='flex items-center gap-2'>
                <Image src={URL.createObjectURL(thumbnail)} width={100} height={100} alt={thumbnail.name} className='rounded-md' />
                <span className='text-base max-md:text-sm text-yellow-500 flex items-start flex-col'>{thumbnail.name} <p className='text-sm text-black'>{thumbnail.size / 1024 < 900 ? (thumbnail.size / 1024).toFixed(2) + ' kb' : (thumbnail.size / (1024 * 1024)).toFixed(2) + ' mb'}</p></span>
            </span>
        </div>
    )

    const showImgs = images?.map((img: File, i) => (
        <div key={i} className='flex items-start flex-col gap-2'>
            <span className='flex items-center gap-2'>
                <Image src={URL.createObjectURL(img)} width={100} height={100} alt={img.name} className='rounded-md' />
                <span className='text-base max-md:text-sm text-yellow-500 flex items-start flex-col'>{img.name} <p className='text-sm text-black'>{img.size / 1024 < 900 ? (img.size / 1024).toFixed(2) + ' kb' : (img.size / (1024 * 1024)).toFixed(2) + ' mb'}</p></span>
            </span>
        </div>
    ))

  return (
    <div className='w-full'>
        <div className='w-full mt-5 h-fit bg-slate-300 rounded-md flex flex-col items-center gap-5 p-14'>
            <input type='text' name='title' placeholder='product title' value={productData.title} onChange={handleChange} className='w-fit max-md:w-40 p-3 max-md:p-1 rounded-md border-none outline-none' />
            <input type='text' name='description' placeholder='product description' value={productData.description} onChange={handleChange} className='w-fit max-md:w-40 p-3 max-md:p-1 rounded-md border-none outline-none' />
            <input type='text' name='price' placeholder='product price' value={productData.price} onChange={handleChange} className='w-fit max-md:w-40 p-3 max-md:p-1 rounded-md border-none outline-none' />
            <input type='text' name='discountPercentage' placeholder='product discountPercentage' value={productData.discountPercentage} onChange={handleChange} className='w-fit max-md:w-40 p-3 max-md:p-1 rounded-md border-none outline-none' />
            <input type='text' name='brand' placeholder='product brand' value={productData.brand} onChange={handleChange} className='w-fit max-md:w-40 p-3 max-md:p-1 rounded-md border-none outline-none' />
            {isLoading ?
            <SkewLoader color="#ffffff" />
            :
            <select name='category' value={productData.category} onChange={handleChange} className='w-fit p-3 max-md:p-1 rounded-md border-none outline-none'>
                {categories?.map((category) => (
                    <option key={category._id} value={category.title}>{category.title}</option>
                ))}
            </select>
            }
            <input id='selectThumbnail' accept="image/*" className='hidden' type='file' onChange={handleFileChange} />
            <button onClick={() => document.getElementById('selectThumbnail')?.click()} className='p-2 max-md:p-1 bg-white max-md:text-xs text-sm text-black hover:text-green-400 duration-200 rounded-md'>Choose thumbnail</button>
            {showThumbnail}
            <input multiple id='selectImager' accept="image/*" className='hidden' type='file' onChange={(e) => e.target.files && setImages([...e.target.files])} />
            <button onClick={() => document.getElementById('selectImager')?.click()} className='p-2 max-md:p-1 bg-white max-md:text-xs text-sm text-black hover:text-green-400 duration-200 rounded-md'>Choose images</button>
            {showImgs}
            {isLoading ?
                <SkewLoader color="#ffffff" />
                :
                <button onClick={(e) => {updateMode ? handleSubmit(e, UPDATE_PRODUCT + productId) : handleSubmit(e, ADD_PRODUCT)}} className='p-3 bg-white text-black hover:text-green-400 duration-200 rounded-md'>{updateMode ? 'Update' : 'Add'}</button>
            }
        </div>
        <div 
        className='w-full flex items-center gap-4 flex-wrap mt-10'
        >
            {products?.map((product: ProductData) => (
                <div
                key={product._id}
                className='flex items-center gap-4 flex-wrap'
                >
                    <div
                    className='flex flex-col justify-center items-center gap-2 border-[1px] border-solid border-green-500 hover:border-green-400 duration-200 rounded-lg p-2'
                    >
                        <Image 
                        src={SHOW_IMG + product.thumbnail} 
                        alt='product thumbnail' 
                        width={400}
                        height={400}
                        className='w-[200px] h-[200px]'
                        />
                        <h2 
                        className='text-lg'
                        >
                            {product.title.slice(0, 15)}
                        </h2>
                        <p 
                        className='text-gray-400'
                        >
                            {product.category}
                        </p>
                        <p 
                        className='font-bold'
                        >
                            ${product.price}
                        </p>
                        <p 
                        className='font-bold text-red-500'
                        >
                            {product.discountPercentage}% off
                        </p>
                        <span
                        className='flex items-center justify-center gap-2'
                        >
                            <FontAwesomeIcon 
                            icon={faTrash}
                            onClick={() => handleDelete(product._id)}
                            className='w-[16px] h-[16px] cursor-pointer duration-200 text-red-500 hover:text-red-400'
                            />
                            <FontAwesomeIcon 
                            icon={faEdit}
                            onClick={() => handleUpdate(product._id)}
                            className='w-[16px] h-[16px] cursor-pointer duration-200 text-blue-500 hover:text-blue-400'
                            />
                        </span>
                    </div>
                </div>
            ))}
        </div>
    </div>
  )
}

export default Products