# Penetration Testing Report
By Nicholas Samson and Olivia Leavitt

## Self Attack
### Attack 1: Nicholas Samson
| Item | Result |
| ---- | ------ |
| Date | December 8, 2025 |
| Target | pizza-service.doddlebopper.click |
| Classification | Injection |
| Severity | 2 | 
| Images | Image not useful |
| Description | Attempted to do SQL injection on the update user endpoint to escalate authorization to admin level. However, SQL queries had been parameterized making the attack unsuccesful. Also attempted to login using default admin, franchisee, and diner credentials, and to gain access to the API key but was unsuccessful. |
| Corrections | None, good job me! |

### Attack 2: Olivia Leavitt
| Item | Result |
| ---- | ------ |
| Date | December 8, 2025 |
| Target | pizza-service.olivialeavitt.click |
| Classification | Weak Login Protection |
| Severity | 1 |
| Images | None |
| Description | I tried logging in many times with wrong passwords and the server never slowed me down or blocked me. This means someone could keep guessing passwords without being stopped. No account was broken into, but it shows the login isn't rate‑limited. |
| Corrections | Add limits to how many times someone can try logging in. |

## Peer Attack
### Peer Attack 1: Nicholas Samson
| Item | Result |
| ---- | ------ |
| Date | December 8, 2025 |
| Target | pizza-service.olivialeavitt.click |
| Classification | Injection |
| Severity | 2 (if successful) |
| Description | Batch injection of random values for Auth_tokens for a user resulted in many invalidated responses, besides one which was when the value was null it resulted in a 200 response and I was able to verify past purchases of pizzas, and login as a user. |
| Corrections | Some more edge cases for validation around storing authtokens. |

### Peer Attack 2: Olivia Leavitt
| Item | Result |
| ---- | ------ |
| Date | December 8, 2025 |
| Target | pizza-service.doddlebopper.click |
| Classification | Broken Input Validation |
| Severity | 2 (successful) |
| Description | I was able to create a new user using only spaces for the name, email, and password fields. The API accepted the request and returned a valid user object and JWT token, meaning the system did not require real input from the user. |
| Corrections | Add backend validation to prevent whitespace-only values and require properly formatted emails and real passwords. |

## Combined Summary of Learnings
 - Penetration testing is hard. For SQL injection you need the query to be just right or it will error or not do what you want, and could notify the developers.
 - Software tools try hard to fix any common exploits. For example, mysql doesn't allow stacked/chained queries to protect against undesired SQL injection attacks. There are also a lot of libraries and functions designed to make sanitizing and parameterizing SQL queries easier.
 - Using tools to automate is helpful, because doing brute force attacks or other attacks in the terminal or browser directly is a pain to input and to read the output from. 
 - It's important to test your software first before putting it out publicly for anyone to potentially attack. Be security minded and think about potential exploits before.
 - When doing penetration testing, do it in a sandboxed dev environment so you can easily repair or rollback any damage.
 - You should check logs and monitor the system for bad actors, and if possible, verify users with admin authority periodically to ensure a hacker doesn't go undetected for too long.