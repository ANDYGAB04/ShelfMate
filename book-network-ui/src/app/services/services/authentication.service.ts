import {inject, Injectable} from '@angular/core';
import {authenticate} from '../fn/authentication/authenticate';
import {register} from '../fn/authentication/register';
import {confirm} from '../fn/authentication/confirm';
import {AuthenticationRequest} from '../models/authentication-request';
import {RegistrationRequest} from '../models/registration-request';
import {Api} from '../api';
import {from} from 'rxjs';

@Injectable({providedIn: 'root'})
export class AuthenticationService {
  private api = inject(Api);

  authenticate(body: AuthenticationRequest) {
    return from(this.api.invoke(authenticate, {body}));
  }

  register(body: RegistrationRequest) {
    return this.api.invoke(register, {body});
  }

  confirm(token: string) {
    return this.api.invoke(confirm, {token});
  }
}
