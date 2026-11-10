package com.project.book.user;

import org.springframework.data.jpa.repository.JpaRepository;

import javax.swing.text.html.Option;
import java.util.Optional;

public interface UseerRepository extends JpaRepository<User,Integer> {
    Optional<User> findbyEmail(String email);
}
