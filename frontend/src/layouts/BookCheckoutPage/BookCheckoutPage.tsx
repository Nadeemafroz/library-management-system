import { useEffect, useState } from "react";
import BookModel from "../../models/BookModel";
import ReviewModel from "../../models/ReviewModel";
//import { SpinnerLoading } from "../Utils/SpinnerLoading";
import { StarsReview } from "../Utils/StarsReview";
import { CheckoutAndReviewBox } from "./CheckoutAndReviewBox";
import { LatestReviews } from "./LatestReviews";
import ReviewRequestModel from "../../models/ReviewRequestModel";
import { SpinnerLoading } from "../Utils/SpinnerLoading";
import bookImage from './../../Images/BooksImages/book-luv2code-1000.png';

export const BookCheckoutPage = () => {
    const [book, setBook] = useState<BookModel>();
    const [isLoading, setIsLoading] = useState(true);
    const [httpError, setHttpError] = useState<string | null>(null);

    const [reviews, setReviews] = useState<ReviewModel[]>([]);
    const [totalStars, setTotalStars] = useState(0);
    const [isLoadingReview, setIsLoadingReview] = useState(true);

    const [isReviewLeft, setIsReviewLeft] = useState(false);
    const [isLoadingUserReview, setIsLoadingUserReview] = useState(true);

    const [currentLoansCount, setCurrentLoansCount] = useState(0);
    const [isLoadingCurrentLoansCount, setIsLoadingCurrentLoansCount] = useState(true);

    const [isCheckedOut, setIsCheckedOut] = useState(false);
    const [isLoadingBookCheckedOut, setIsLoadingBookCheckedOut] = useState(true);

    const bookId = window.location.pathname.split('/')[2];
    const token = localStorage.getItem("token");
    let isAuthenticated = false;
    if(token){
        isAuthenticated = true;
    }
    

    useEffect(() => {
        const fetchBook = async () => {
            try {
                const response = await fetch(`https://api.nadeem.sbs/api/books/${bookId}`);
                if (!response.ok) throw new Error("Something went wrong!");

                const data = await response.json();
                const loadedBook: BookModel = {
                    id: data.id,
                    title: data.title,
                    author: data.author,
                    description: data.description,
                    copies: data.copies,
                    copiesAvailable: data.copiesAvailable,
                    category: data.category,
                    img: data.img,
                };
                setBook(loadedBook);
                console.log(loadedBook); ////////////////////////////////////delete
                setIsLoading(false);
            } catch (error: any) {
                setIsLoading(false);
                setHttpError(error.message);
            }
        };
        fetchBook();
    }, [isCheckedOut]);

    useEffect(() => {
        const fetchBookReviews = async () => {
            try {
                const response = await fetch(`https://api.nadeem.sbs/api/reviews/search/findByBookId?bookId=${bookId}`);
                if (!response.ok) throw new Error("Something went wrong!");

                const data = await response.json();
                const responseData = data._embedded.reviews;

                const loadedReviews: ReviewModel[] = [];
                let weightedStars = 0;

                for (const review of responseData) {
                    loadedReviews.push({
                        id: review.id,
                        userEmail: review.userEmail,
                        date: review.date,
                        rating: review.rating,
                        book_id: review.bookId,
                        reviewDescription: review.reviewDescription,
                    });
                    weightedStars += review.rating;
                }

                if (loadedReviews.length > 0) {
                    const average = (Math.round((weightedStars / loadedReviews.length) * 2) / 2).toFixed(1);
                    setTotalStars(Number(average));
                }

                console.log(loadedReviews);  /////////////////////////////////////delete
                setReviews(loadedReviews);
                setIsLoadingReview(false);
            } catch (error: any) {
                setIsLoadingReview(false);
                setHttpError(error.message);
            }
        };
        fetchBookReviews();
    }, [isReviewLeft]);

    useEffect(() => {
        const fetchUserReview = async () => {
            if (!isAuthenticated || !token) return;
            try {
                const response = await fetch(
                    `https://api.nadeem.sbs/api/reviews/secure/user/book?bookId=${bookId}`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    }
                );
                if (!response.ok) throw new Error("Something went wrong");
                const userReview = await response.json();
                setIsReviewLeft(userReview);
            } catch (error: any) {
                setHttpError(error.message);
            } finally {
                setIsLoadingUserReview(false);
            }
        };
        fetchUserReview();
    }, [isAuthenticated]);

    useEffect(() => {
        const fetchCurrentLoansCount = async () => {
            if (!isAuthenticated || !token) return;
            try {
                const response = await fetch(
                    `https://api.nadeem.sbs/api/books/secure/currentloans/count`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    }
                );
                if (!response.ok) throw new Error("Something went wrong");
                const count = await response.json();
                setCurrentLoansCount(count);
            } catch (error: any) {
                setHttpError(error.message);
            } finally {
                setIsLoadingCurrentLoansCount(false);
            }
        };
        fetchCurrentLoansCount();
    }, [isAuthenticated, isCheckedOut]);

    useEffect(() => {
        const fetchBookCheckedOutStatus = async () => {
            if (!isAuthenticated || !token) return;
            try {
                const response = await fetch(
                    `https://api.nadeem.sbs/api/books/secure/ischeckedout/byuser?bookId=${bookId}`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    }
                );
                if (!response.ok) throw new Error("Something went wrong");
                const result = await response.json();
                setIsCheckedOut(result);
            } catch (error: any) {
                setHttpError(error.message);
            } finally {
                setIsLoadingBookCheckedOut(false);
            }
        };
        fetchBookCheckedOutStatus();
    }, [isAuthenticated]);

    if (isLoading || isLoadingReview || isLoadingCurrentLoansCount || isLoadingBookCheckedOut || isLoadingUserReview) {
        return <SpinnerLoading />;
        
    }

    if (httpError) {
        return (
            <div className="container m-5">
                <p>{httpError}</p>
            </div>
        );
    }

    async function checkoutBook() {
        if (!token) return;

        try {
            const response = await fetch(
                `/api/books/secure/checkout?bookId=${book?.id}`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            if (!response.ok) throw new Error("Something went wrong!");
            setIsCheckedOut(true);
        } catch (error: any) {
            alert(error.message);
        }
    }

    async function submitReview(starInput: number, reviewDescription: string) {
        if (!token || !book?.id) return;

        const reviewRequest = new ReviewRequestModel(starInput, book.id, reviewDescription);

        try {
            const response = await fetch(`/api/reviews/secure`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(reviewRequest),
            });

            if (!response.ok) throw new Error("Something went wrong!");
            setIsReviewLeft(true);
        } catch (error: any) {
            alert(error.message);
        }
    }

    return (
        <div>
            <div className="container d-none d-lg-block">
                <div className="row mt-5">
                    <div className="col-sm-2 col-md-2">
                        {book?.img ? (
                            <img src={book.img} width="226" height="349" alt="Book" />
                        ) : (
                            <img
                                src={bookImage}
                                width="226"
                                height="349"
                                alt="Book"
                            />
                        )}
                    </div>
                    <div className="col-4 col-md-4 container">
                        <div className="ml-2">
                            <h2>{book?.title}</h2>
                            <h5 className="text-primary">{book?.author}</h5>
                            <p className="lead">{book?.description}</p>
                            <StarsReview rating={totalStars} size={32} />
                        </div>
                    </div>
                    <CheckoutAndReviewBox
                        book={book}
                        mobile={false}
                        currentLoansCount={currentLoansCount}
                        isAuthenticated={isAuthenticated}
                        isCheckedOut={isCheckedOut}
                        checkoutBook={checkoutBook}
                        isReviewLeft={isReviewLeft}
                        submitReview={submitReview}
                    />
                </div>
                <hr />
                <LatestReviews reviews={reviews} bookId={book?.id} mobile={false} />
            </div>

            {/* Mobile view */}
            <div className="container d-lg-none mt-5">
                <div className="d-flex justify-content-center align-items-center">
                    {book?.img ? (
                        <img src={book.img} width="226" height="349" alt="Book" />
                    ) : (
                        <img
                            src={bookImage}
                            width="226"
                            height="349"
                            alt="Book"
                        />
                    )}
                </div>
                <div className="mt-4">
                    <div className="ml-2">
                        <h2>{book?.title}</h2>
                        <h5 className="text-primary">{book?.author}</h5>
                        <p className="lead">{book?.description}</p>
                        <StarsReview rating={totalStars} size={32} />
                    </div>
                </div>
                <CheckoutAndReviewBox
                    book={book}
                    mobile={true}
                    currentLoansCount={currentLoansCount}
                    isAuthenticated={isAuthenticated}
                    isCheckedOut={isCheckedOut}
                    checkoutBook={checkoutBook}
                    isReviewLeft={isReviewLeft}
                    submitReview={submitReview}
                />
                <hr />
                <LatestReviews reviews={reviews} bookId={book?.id} mobile={true} />
            </div>
        </div>
    );
};
