import {Component, inject} from '@angular/core';
import {RegistrationRequest} from '../../services/models/registration-request';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Router} from '@angular/router';
import {AuthenticationService} from '../../services/services/authentication.service';

@Component({
  selector: 'app-register',
  imports: [
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {

  registerRequest: RegistrationRequest = {email: '', firstname: '', lastname: '', password: ''}
  errorMsg: Array<string> = [];
  private router = inject(Router);
  private authService = inject(AuthenticationService);

  register() {
    this.errorMsg = [];
    this.authService.register(this.registerRequest)
      .subscribe({
        next: () => {
          this.router.navigate(['activate-account']);
        },
        error: (err) => {
          this.errorMsg = err.error.validationErrors;
        }
      })
  }

  login() {
    this.router.navigate(['login'])
  }
}
