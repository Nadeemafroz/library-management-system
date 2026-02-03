import { useEffect, useState } from "react";
import BookModel from "../../../models/BookModel";

export const ChangeQuantityOfBook: React.FC<{ book: BookModel, deleteBook: any }> = (props) => {
    const [quantity, setQuantity] = useState<number>(0);
    const [remaining, setRemaining] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchBookInState = () => {
            props.book.copies ? setQuantity(props.book.copies) : setQuantity(0);
            props.book.copiesAvailable ? setRemaining(props.book.copiesAvailable) : setRemaining(0);
        };
        fetchBookInState();
    }, [props.book]);

    // Get JWT token from local storage
    const getJwtToken = () => {
        return localStorage.getItem('token'); // Adjust this based on where you store your token
    };

    async function increaseQuantity() {
        const token = getJwtToken();
        if (!token) {
            console.error('No JWT token found');
            return;
        }
        
        setIsLoading(true);
        try {
            const url = `https://api.nadeem.sbs/api/admin/secure/increase/book/quantity?bookId=${props.book?.id}`;
            const requestOptions = {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            };

            const quantityUpdateResponse = await fetch(url, requestOptions);
            if (!quantityUpdateResponse.ok) {
                throw new Error('Something went wrong!');
            }
            setQuantity(quantity + 1);
            setRemaining(remaining + 1);
        } catch (error) {
            console.error('Error increasing quantity:', error);
        } finally {
            setIsLoading(false);
        }
    }

    async function decreaseQuantity() {
        const token = getJwtToken();
        if (!token) {
            console.error('No JWT token found');
            return;
        }
        
        setIsLoading(true);
        try {
            const url = `https://api.nadeem.sbs/api/admin/secure/decrease/book/quantity?bookId=${props.book.id}`;
            const requestOptions = {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            };

            const quantityUpdateResponse = await fetch(url, requestOptions);
            if (!quantityUpdateResponse.ok) {
                throw new Error('Something went wrong!');
            }
            setQuantity(quantity - 1);
            setRemaining(remaining - 1);
        } catch (error) {
            console.error('Error decreasing quantity:', error);
        } finally {
            setIsLoading(false);
        }
    }

    async function deleteBook() {
        const token = getJwtToken();
        if (!token) {
            console.error('No JWT token found');
            return;
        }
        
        setIsLoading(true);
        try {
            const url = `https://api.nadeem.sbs/api/admin/secure/delete/book/?bookId=${props.book?.id}`;
            const requestOptions = {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            };

            const updateResponse = await fetch(url, requestOptions);
            if (!updateResponse.ok) {
                throw new Error('Something went wrong!');
            }
            props.deleteBook();
        } catch (error) {
            console.error('Error deleting book:', error);
        } finally {
            setIsLoading(false);
        }
    }
    
    return (
        <div className='card mt-3 shadow p-3 mb-3 bg-body rounded'>
            <div className='row g-0'>
                <div className='col-md-2'>
                    <div className='d-none d-lg-block'>
                        {props.book.img ?
                            <img src={props.book.img} width='123' height='196' alt='Book' />
                            :
                            <img src={require('./../../../Images/BooksImages/book-luv2code-1000.png')} 
                                width='123' height='196' alt='Book' />
                        }
                    </div>
                    <div className='d-lg-none d-flex justify-content-center align-items-center'>
                        {props.book.img ?
                            <img src={props.book.img} width='123' height='196' alt='Book' />
                            :
                            <img src={require('./../../../Images/BooksImages/book-luv2code-1000.png')} 
                                width='123' height='196' alt='Book' />
                        }
                    </div>
                </div>
                <div className='col-md-6'>
                    <div className='card-body'>
                        <h5 className='card-title'>{props.book.author}</h5>
                        <h4>{props.book.title}</h4>
                        <p className='card-text'> {props.book.description} </p>
                    </div>
                </div>
                <div className='mt-3 col-md-4'>
                    <div className='d-flex justify-content-center algin-items-center'>
                        <p>Total Quantity: <b>{quantity}</b></p>
                    </div>
                    <div className='d-flex justify-content-center align-items-center'>
                        <p>Books Remaining: <b>{remaining}</b></p>
                    </div>
                </div>
                <div className='mt-3 col-md-1'>
                    <div className='d-flex justify-content-start'>
                        <button 
                            className='m-1 btn btn-md btn-danger' 
                            onClick={deleteBook}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Processing...' : 'Delete'}
                        </button>
                    </div>
                </div>
                <button 
                    className='m1 btn btn-md main-color text-white' 
                    onClick={increaseQuantity}
                    disabled={isLoading}
                >
                    {isLoading ? 'Processing...' : 'Add Quantity'}
                </button>
                <button 
                    className='m1 btn btn-md btn-warning' 
                    onClick={decreaseQuantity}
                    disabled={isLoading || quantity <= 0}
                >
                    {isLoading ? 'Processing...' : 'Decrease Quantity'}
                </button>
            </div>
        </div>
    );
}