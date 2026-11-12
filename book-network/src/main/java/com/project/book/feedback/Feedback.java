package com.project.book.feedback;

import com.project.book.book.Book;
import com.project.book.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class Feedback extends BaseEntity {

    private Double note;
    private String comment;

    @ManyToOne
    @JoinColumn(name = "book_id")
    private Book book;
}
