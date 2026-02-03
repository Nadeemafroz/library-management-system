package com.luv2code.springbootlibrary.controller;

import com.luv2code.springbootlibrary.entity.Book;
import com.luv2code.springbootlibrary.responsemodels.ShelfCurrentLoansResponse;
import com.luv2code.springbootlibrary.service.BookService;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/books")
public class BookController {

    private final BookService bookService;

    @Autowired
    public BookController(BookService bookService) {
        this.bookService = bookService;
    }

    /* Public endpoints */
    @GetMapping("/hello")
    public String hello() {
        return "Hello from Library Service";
    }

    /* Secure endpoints (require authentication) */
    @GetMapping("/secure/currentloans")
    public List<ShelfCurrentLoansResponse> currentLoans(Authentication authentication) throws Exception {
        String userEmail = authentication.getName();
        return bookService.currentLoans(userEmail);
    }

    @GetMapping("/secure/currentloans/count")
    public int currentLoansCount(Authentication authentication) {
        String userEmail = authentication.getName();
        return bookService.currentLoansCount(userEmail);
    }

    @GetMapping("/secure/ischeckedout/byuser")
    public Boolean checkoutBookByUser(Authentication authentication,
                                      @RequestParam Long bookId) {
        String userEmail = authentication.getName();
        return bookService.checkoutBookByUser(userEmail, bookId);
    }

    @PutMapping("/secure/checkout")
    public Book checkoutBook(Authentication authentication,
                             @RequestParam Long bookId) throws Exception {
        String userEmail = authentication.getName();
        return bookService.checkoutBook(userEmail, bookId);
    }

    @PutMapping("/secure/return")
public ResponseEntity<?> returnBook(
        @RequestParam Long bookId,
        HttpServletRequest request) {

    String email = jwtUtil.getEmailFromRequest(request);

    if (email == null) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    boolean returned = bookService.returnBook(email, bookId);

    if (!returned) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body("Book not checked out by user");
    }

    return ResponseEntity.ok().build();
}

    @PutMapping("/secure/renew/loan")
    public void renewLoan(Authentication authentication,
                          @RequestParam Long bookId) throws Exception {
        String userEmail = authentication.getName();
        bookService.renewLoan(userEmail, bookId);
    }

    /* Admin endpoints would be in AdminController */
}