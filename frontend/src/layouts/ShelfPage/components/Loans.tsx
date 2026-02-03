import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ShelfCurrentLoans from '../../../models/ShelfCurrentLoans';
import { SpinnerLoading } from '../../Utils/SpinnerLoading';
import { LoansModal } from './LoansModal';

export const Loans = () => {
    const [httpError, setHttpError] = useState<string | null>(null);
    const [shelfCurrentLoans, setShelfCurrentLoans] = useState<ShelfCurrentLoans[]>([]);
    const [isLoadingUserLoans, setIsLoadingUserLoans] = useState(true);
    const [checkout, setCheckout] = useState(false);

    // Get JWT token from local storage
    const getJwtToken = () => {
        return localStorage.getItem('token');
    };

    useEffect(() => {
        const fetchUserCurrentLoans = async () => {
            const token = getJwtToken();
            if (!token) {
                setHttpError('Authentication required');
                setIsLoadingUserLoans(false);
                return;
            }

            try {
                const url = `https://api.nadeem.sbs/api/books/secure/currentloans`;
                const requestOptions = {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                };
                const shelfCurrentLoansResponse = await fetch(url, requestOptions);
                
                if (!shelfCurrentLoansResponse.ok) {
                    if (shelfCurrentLoansResponse.status === 401) {
                        throw new Error('Unauthorized - Please login again');
                    }
                    throw new Error('Something went wrong!');
                }
                
                const shelfCurrentLoansResponseJson = await shelfCurrentLoansResponse.json();
                setShelfCurrentLoans(shelfCurrentLoansResponseJson);
            } catch (error: any) {
                setHttpError(error.message);
            }
            setIsLoadingUserLoans(false);
        };
        fetchUserCurrentLoans();
        window.scrollTo(0, 0);
    }, [checkout]);

    async function returnBook(bookId: number) {
        console.log("return function started");
        const token = getJwtToken();
        if (!token) {
            setHttpError('Authentication required');
            return;
        }

        try {
            const url = `https://api.nadeem.sbs/api/books/secure/return?bookId=${bookId}`;
            const requestOptions = {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            };
            const returnResponse = await fetch(url, requestOptions);
            console.log(returnResponse);
            
            if (!returnResponse.ok) {
                if (returnResponse.status === 401) {
                    throw new Error('Unauthorized - Please login again');
                }
                throw new Error('Something went wrong!');
            }
            
            setCheckout(!checkout);
        } catch (error: any) {
            console.error('Error returning book:', error);
            setHttpError(error.message);
        }
    }

    async function renewLoan(bookId: number) {
        const token = getJwtToken();
        if (!token) {
            setHttpError('Authentication required');
            return;
        }

        try {
            const url = `https://api.nadeem.sbs/api/books/secure/renew/loan?bookId=${bookId}`;
            const requestOptions = {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            };

            const returnResponse = await fetch(url, requestOptions);
            
            if (!returnResponse.ok) {
                if (returnResponse.status === 401) {
                    throw new Error('Unauthorized - Please login again');
                }
                throw new Error('Something went wrong!');
            }
            
            setCheckout(!checkout);
        } catch (error: any) {
            console.error('Error renewing loan:', error);
            setHttpError(error.message);
        }
    }

    if (isLoadingUserLoans) {
        return <SpinnerLoading/>;
    }

    if (httpError) {
        return (
            <div className='container m-5'>
                <p>{httpError}</p>
                {httpError === 'Authentication required' && (
                    <Link className='btn btn-primary' to='/login'>
                        Login
                    </Link>
                )}
            </div>
        );
    }

    return (
        <div>
            {/* Desktop */}
            <div className='d-none d-lg-block mt-2'>
                {shelfCurrentLoans.length > 0 ? 
                <>
                    <h5>Current Loans: </h5>

                    {shelfCurrentLoans.map(shelfCurrentLoan => (
                        <div key={shelfCurrentLoan.book.id}>
                            <div className='row mt-3 mb-3'>
                                <div className='col-4 col-md-4 container'>
                                    {shelfCurrentLoan.book?.img ? 
                                        <img src={shelfCurrentLoan.book?.img} width='226' height='349' alt='Book'/>
                                        :
                                        <img src={require('./../../../Images/BooksImages/book-luv2code-1000.png')} 
                                            width='226' height='349' alt='Book'/>
                                    }
                                </div>
                                <div className='card col-3 col-md-3 container d-flex'>
                                    <div className='card-body'>
                                        <div className='mt-3'>
                                            <h4>Loan Options</h4>
                                            {shelfCurrentLoan.daysLeft > 0 && 
                                                <p className='text-secondary'>
                                                    Due in {shelfCurrentLoan.daysLeft} days.
                                                </p>
                                            }
                                            {shelfCurrentLoan.daysLeft === 0 && 
                                                <p className='text-success'>
                                                    Due Today.
                                                </p>
                                            }
                                            {shelfCurrentLoan.daysLeft < 0 && 
                                                <p className='text-danger'>
                                                    Past due by {Math.abs(shelfCurrentLoan.daysLeft)} days.
                                                </p>
                                            }
                                            <div className='list-group mt-3'>
                                                <button className='list-group-item list-group-item-action' 
                                                    aria-current='true' data-bs-toggle='modal' 
                                                    data-bs-target={`#modal${shelfCurrentLoan.book.id}`}>
                                                        Manage Loan
                                                </button>
                                                <Link to={'search'} className='list-group-item list-group-item-action'>
                                                    Search more books?
                                                </Link>
                                            </div>
                                        </div>
                                        <hr/>
                                        <p className='mt-3'>
                                            Help others find their adventure by reviewing your loan.
                                        </p>
                                        <Link className='btn btn-primary' to={`/checkout/${shelfCurrentLoan.book.id}`}>
                                            Leave a review
                                        </Link>
                                    </div>
                                </div>
                            </div>
                            <hr/>
                            <LoansModal shelfCurrentLoan={shelfCurrentLoan} mobile={false} returnBook={returnBook} 
                                renewLoan={renewLoan}/>
                        </div>
                    ))}
                </> :
                <>
                    <h3 className='mt-3'>
                        Currently no loans
                    </h3>
                    <Link className='btn btn-primary' to={`search`}>
                        Search for a new book
                    </Link>
                </>
                }
            </div>

            {/* Mobile */}
            <div className='container d-lg-none mt-2'>
                {shelfCurrentLoans.length > 0 ? 
                <>
                    <h5 className='mb-3'>Current Loans: </h5>

                    {shelfCurrentLoans.map(shelfCurrentLoan => (
                        <div key={shelfCurrentLoan.book.id}>
                                <div className='d-flex justify-content-center align-items-center'>
                                    {shelfCurrentLoan.book?.img ? 
                                        <img src={shelfCurrentLoan.book?.img} width='226' height='349' alt='Book'/>
                                        :
                                        <img src={require('./../../../Images/BooksImages/book-luv2code-1000.png')} 
                                            width='226' height='349' alt='Book'/>
                                    }
                                </div>
                                <div className='card d-flex mt-5 mb-3'>
                                    <div className='card-body container'>
                                        <div className='mt-3'>
                                            <h4>Loan Options</h4>
                                            {shelfCurrentLoan.daysLeft > 0 && 
                                                <p className='text-secondary'>
                                                    Due in {shelfCurrentLoan.daysLeft} days.
                                                </p>
                                            }
                                            {shelfCurrentLoan.daysLeft === 0 && 
                                                <p className='text-success'>
                                                    Due Today.
                                                </p>
                                            }
                                            {shelfCurrentLoan.daysLeft < 0 && 
                                                <p className='text-danger'>
                                                    Past due by {Math.abs(shelfCurrentLoan.daysLeft)} days.
                                                </p>
                                            }
                                            <div className='list-group mt-3'>
                                                <button className='list-group-item list-group-item-action' 
                                                    aria-current='true' data-bs-toggle='modal' 
                                                    data-bs-target={`#mobilemodal${shelfCurrentLoan.book.id}`}>
                                                        Manage Loan
                                                </button>
                                                <Link to={'search'} className='list-group-item list-group-item-action'>
                                                    Search more books?
                                                </Link>
                                            </div>
                                        </div>
                                        <hr/>
                                        <p className='mt-3'>
                                            Help others find their adventure by reviewing your loan.
                                        </p>
                                        <Link className='btn btn-primary' to={`/checkout/${shelfCurrentLoan.book.id}`}>
                                            Leave a review
                                        </Link>
                                    </div>
                                </div>
                            
                            <hr/>
                            <LoansModal shelfCurrentLoan={shelfCurrentLoan} mobile={true} returnBook={returnBook} 
                                renewLoan={renewLoan}/>
                        </div>
                    ))}
                </> :
                <>
                    <h3 className='mt-3'>
                        Currently no loans
                    </h3>
                    <Link className='btn btn-primary' to={`search`}>
                        Search for a new book
                    </Link>
                </>
                }
            </div>
        </div>
    );
}