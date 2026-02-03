import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import HistoryModel from '../../../models/HistoryModel';
import { Pagination } from '../../Utils/Pagination';
import { SpinnerLoading } from '../../Utils/SpinnerLoading';

export const HistoryPage = () => {
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);
    const [httpError, setHttpError] = useState<string | null>(null);
    const [histories, setHistories] = useState<HistoryModel[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    // Function to decode JWT and extract email
    const getEmailFromToken = () => {
        const token = localStorage.getItem('token');
        if (!token) return null;
        
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.sub || payload.email; // Use 'sub' or 'email' depending on your JWT claims
        } catch (e) {
            console.error('Error decoding token:', e);
            return null;
        }
    };

    useEffect(() => {
        const fetchUserHistory = async () => {
            const token = localStorage.getItem('token');
            const userEmail = getEmailFromToken();
            
            if (!token || !userEmail) {
                setHttpError('Authentication required');
                setIsLoadingHistory(false);
                return;
            }

            try {
                const url = `https://api.nadeem.sbs/api/histories/search/findBooksByUserEmail?userEmail=${encodeURIComponent(userEmail)}&page=${currentPage - 1}&size=5`;
                const requestOptions = {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                };
                
                const historyResponse = await fetch(url, requestOptions);
                
                if (!historyResponse.ok) {
                    if (historyResponse.status === 401) {
                        throw new Error('Unauthorized - Please login again');
                    }
                    throw new Error('Something went wrong!');
                }
                
                const historyResponseJson = await historyResponse.json();
                setHistories(historyResponseJson._embedded.histories);
                setTotalPages(historyResponseJson.page.totalPages);
            } catch (error: any) {
                setHttpError(error.message);
            }
            setIsLoadingHistory(false);
        };
        fetchUserHistory();
    }, [currentPage]);

    if (isLoadingHistory) {
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
    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
    
    return(
        <div className='mt-2'>
            {histories.length > 0 ? 
            <>
                <h5>Recent History:</h5>

                {histories.map(history => (
                    <div key={history.id}>
                        <div className='card mt-3 shadow p-3 mb-3 bg-body rounded'>
                            <div className='row g-0'>
                                <div className='col-md-2'>
                                    <div className='d-none d-lg-block'>
                                        {history.img ? 
                                            <img src={history.img} width='123' height='196' alt='Book' />
                                            :
                                            <img src={require('./../../../Images/BooksImages/book-luv2code-1000.png')} 
                                                width='123' height='196' alt='Default'/>
                                        }
                                    </div>
                                    <div className='d-lg-none d-flex justify-content-center align-items-center'>
                                        {history.img ? 
                                            <img src={history.img} width='123' height='196' alt='Book' />
                                            :
                                            <img src={require('./../../../Images/BooksImages/book-luv2code-1000.png')} 
                                                width='123' height='196' alt='Default'/>
                                        }
                                    </div>
                                </div>
                                <div className='col'>
                                        <div className='card-body'>
                                            <h5 className='card-title'> {history.author} </h5>
                                            <h4>{history.title}</h4>
                                            <p className='card-text'>{history.description}</p>
                                            <hr/>
                                            <p className='card-text'> Checked out on: {history.checkoutDate}</p>
                                            <p className='card-text'> Returned on: {history.returnedDate}</p>
                                        </div>
                                </div>
                            </div>
                        </div>
                        <hr/>
                    </div>
                ))}
            </>
            :
            <>
                <h3 className='mt-3'>Currently no history: </h3>
                <Link className='btn btn-primary' to={'search'}>
                    Search for new book
                </Link>
            </>
            }
            {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} paginate={paginate}/>}
        </div>
    );
}