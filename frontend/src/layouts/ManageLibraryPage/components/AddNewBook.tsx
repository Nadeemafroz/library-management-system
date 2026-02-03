import { useState } from 'react';
import AddBookRequest from '../../../models/AddBookRequest';

export const AddNewBook = () => {
    const token = localStorage.getItem('token');

    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [description, setDescription] = useState('');
    const [copies, setCopies] = useState(0);
    const [category, setCategory] = useState('Category');
    const [selectedImage, setSelectedImage] = useState<any>(null);

    const [displayWarning, setDisplayWarning] = useState(false);
    const [displaySuccess, setDisplaySuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    function categoryField(value: string) {
        setCategory(value);
    }

    async function base64ConversionForImages(e: any) {
        if (e.target.files[0]) {
            getBase64(e.target.files[0]);
        }
    }

    function getBase64(file: any) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => setSelectedImage(reader.result);
        reader.onerror = (error) => console.error('Image conversion error:', error);
    }

    async function submitNewBook() {
        const url = `https://api.nadeem.sbs/api/admin/secure/add/book`;

        if (title && author && category !== 'Category' && description && copies >= 0) {
            setIsLoading(true);
            try {
                const book: AddBookRequest = new AddBookRequest(title, author, description, copies, category);
                book.img = selectedImage;

                const requestOptions = {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(book)
                };

                const response = await fetch(url, requestOptions);
                if (!response.ok) throw new Error('Failed to add book');

                // Reset form
                setTitle('');
                setAuthor('');
                setDescription('');
                setCopies(0);
                setCategory('Category');
                setSelectedImage(null);
                setDisplayWarning(false);
                setDisplaySuccess(true);
            } catch (error) {
                console.error('Error adding book:', error);
                setDisplayWarning(true);
                setDisplaySuccess(false);
            } finally {
                setIsLoading(false);
            }
        } else {
            setDisplayWarning(true);
            setDisplaySuccess(false);
        }
    }

    return (
        <div className='container mt-5 mb-5'>
            {displaySuccess && 
                <div className='alert alert-success' role='alert'>
                    Book added successfully
                </div>
            }
            {displayWarning && 
                <div className='alert alert-danger' role='alert'>
                    Please fill in all required fields correctly.
                </div>
            }

            <div className='card'>
                <div className='card-header'>Add a new book</div>
                <div className='card-body'>
                    <div className='row'>
                        <div className='col-md-6 mb-3'>
                            <label className='form-label'>Title</label>
                            <input type='text' className='form-control' required
                                onChange={e => setTitle(e.target.value)} value={title} />
                        </div>
                        <div className='col-md-3 mb-3'>
                            <label className='form-label'>Author</label>
                            <input type='text' className='form-control' required
                                onChange={e => setAuthor(e.target.value)} value={author} />
                        </div>
                        <div className='col-md-3 mb-3'>
                            <label className='form-label'>Category</label>
                            <button className='form-control btn btn-secondary dropdown-toggle' type='button'
                                data-bs-toggle='dropdown' aria-expanded='false'>
                                {category}
                            </button>
                            <ul className='dropdown-menu'>
                                <li><a onClick={() => categoryField('FE')} className='dropdown-item'>Front End</a></li>
                                <li><a onClick={() => categoryField('BE')} className='dropdown-item'>Back End</a></li>
                                <li><a onClick={() => categoryField('Data')} className='dropdown-item'>Data</a></li>
                                <li><a onClick={() => categoryField('DevOps')} className='dropdown-item'>DevOps</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className='mb-3'>
                        <label className='form-label'>Description</label>
                        <textarea className='form-control' rows={3}
                            onChange={e => setDescription(e.target.value)} value={description}></textarea>
                    </div>
                    <div className='col-md-3 mb-3'>
                        <label className='form-label'>Copies</label>
                        <input type='number' className='form-control' required
                            onChange={e => setCopies(Number(e.target.value))} value={copies} />
                    </div>
                    <div className='mb-3'>
                        <label className='form-label'>Book Cover</label>
                        <input type='file' className='form-control' onChange={base64ConversionForImages} />
                    </div>
                    <button 
                        type='button'
                        className='btn btn-primary mt-3'
                        onClick={submitNewBook}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Adding...' : 'Add Book'}
                    </button>
                </div>
            </div>
        </div>
    );
};
