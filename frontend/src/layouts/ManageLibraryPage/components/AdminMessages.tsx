import { useEffect, useState } from 'react';
import AdminMessageRequest from '../../../models/AdminMessageRequest';
import MessageModel from '../../../models/MessageModel';
import { Pagination } from '../../Utils/Pagination';
import { SpinnerLoading } from '../../Utils/SpinnerLoading';
import { AdminMessage } from './AdminMessage';

export const AdminMessages = () => {
    const token = localStorage.getItem('token');

    const [isLoadingMessages, setIsLoadingMessages] = useState(true);
    const [httpError, setHttpError] = useState<string | null>(null);

    const [messages, setMessages] = useState<MessageModel[]>([]);
    const [messagesPerPage] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    const [btnSubmit, setBtnSubmit] = useState(false);

    useEffect(() => {
        const fetchUserMessages = async () => {
            const url = `https://api.nadeem.sbs/api/messages/search/findByClosed?closed=false&page=${currentPage - 1}&size=${messagesPerPage}`;
            const requestOptions = {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            };

            try {
                const messagesResponse = await fetch(url, requestOptions);
                if (!messagesResponse.ok) {
                    throw new Error('Something went wrong!');
                }

                const messagesResponseJson = await messagesResponse.json();
                setMessages(messagesResponseJson._embedded.messages);
                setTotalPages(messagesResponseJson.page.totalPages);
            } catch (error: any) {
                setHttpError(error.message);
            } finally {
                setIsLoadingMessages(false);
            }
        };

        fetchUserMessages();
        window.scrollTo(0, 0);
    }, [currentPage, btnSubmit]);

    async function submitResponseToQuestion(id: number, response: string) {
        if (id && response.trim() !== '') {
            const url = `https://api.nadeem.sbs/api/messages/secure/admin/message`;
            try {
                const requestModel = new AdminMessageRequest(id, response);
                const requestOptions = {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(requestModel)
                };

                const responseObj = await fetch(url, requestOptions);
                if (!responseObj.ok) {
                    throw new Error('Something went wrong!');
                }

                setBtnSubmit(prev => !prev);
            } catch (error) {
                console.error('Error submitting response:', error);
            }
        }
    }

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    if (isLoadingMessages) return <SpinnerLoading />;

    if (httpError) {
        return (
            <div className='container m-5'>
                <p>{httpError}</p>
            </div>
        );
    }

    return (
        <div className='mt-3'>
            {messages.length > 0 ? (
                <>
                    <h5>Pending Q/A: </h5>
                    {messages.map(message => (
                        <AdminMessage 
                            message={message} 
                            key={message.id} 
                            submitResponseToQuestion={submitResponseToQuestion}
                        />
                    ))}
                </>
            ) : (
                <h5>No pending Q/A</h5>
            )}
            {totalPages > 1 && (
                <Pagination 
                    currentPage={currentPage} 
                    totalPages={totalPages} 
                    paginate={paginate} 
                />
            )}
        </div>
    );
};
