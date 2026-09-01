package com.hms.myapp.repository;

import com.hms.myapp.domain.Guest;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the Guest entity.
 */
@Repository
public interface GuestRepository extends JpaRepository<Guest, Long> {
    default Optional<Guest> findOneWithEagerRelationships(Long id) {
        return this.findOneWithToOneRelationships(id);
    }

    default List<Guest> findAllWithEagerRelationships() {
        return this.findAllWithToOneRelationships();
    }

    default Page<Guest> findAllWithEagerRelationships(Pageable pageable) {
        return this.findAllWithToOneRelationships(pageable);
    }

    @Query(value = "select guest from Guest guest left join fetch guest.user", countQuery = "select count(guest) from Guest guest")
    Page<Guest> findAllWithToOneRelationships(Pageable pageable);

    @Query("select guest from Guest guest left join fetch guest.user")
    List<Guest> findAllWithToOneRelationships();

    @Query("select guest from Guest guest left join fetch guest.user where guest.id =:id")
    Optional<Guest> findOneWithToOneRelationships(@Param("id") Long id);

    List<Guest> findByUserLogin(String login);

    Optional<Guest> findOneByUserId(String userId);
}
