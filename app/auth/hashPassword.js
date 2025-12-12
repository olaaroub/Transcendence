/*
Argon2id :It is the winner of the Password Hashing Competition (PHC) and is recommended by OWASP (Open Web Application Security Project).

The Concept

You never store the actual password. You store a "hash"—a one-way scrambled version of the password.

    Hashing: One-way transformation (you can't turn the hash back into the password).

    Salting: Adding a unique random string (salt) to every user's password before hashing. This prevents attackers from cracking everyone's password at once if they steal your database.

    Work Factor: Making the hashing process intentionally "slow" (e.g., taking 0.1 seconds instead of 0.00001 seconds). This stops hackers from guessing billions of passwords per second
*/