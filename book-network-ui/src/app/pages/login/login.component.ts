import {Component, inject} from '@angular/core';
import {AuthenticationRequest} from '../../services/models/authentication-request';
import {FormsModule} from '@angular/forms';
import {Router} from '@angular/router';
import {AuthenticationService} from '../../services/services/authentication.service';
import {AuthenticationResponse} from '../../services/models/authentication-response';
import {TokenService} from '../../token/token.service';

@Component({
  selector: 'app-login',
  imports: [
    FormsModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  authRequest: AuthenticationRequest = {email: '', password: ''};
  errorMsg: Array<string> = [];
  private router = inject(Router);
  private authService = inject(AuthenticationService);
  private tokenService = inject(TokenService);

  login() {
    this.errorMsg = [];
    this.authService.authenticate(this.authRequest).subscribe({
      next: (res: AuthenticationResponse) => {
        this.tokenService.token = res.token as string;
        this.router.navigate(['books']);
      },
      error: (err) => {
        console.log(err);
        if (err.error.validationErrors) {
          this.errorMsg = err.error.validationErrors;
        } else {
          this.errorMsg.push(err.error.error);
        }
      }
    });
  }

  register() {
    this.router.navigate(['register'])
  }
}
