import {HttpInterceptorFn} from '@angular/common/http';
import {inject} from '@angular/core';
import {AuthService} from '../services/auth.service';
import {Tokens} from '../models/tokens.model';
import {environment} from '../../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const tokensJson = localStorage.getItem(environment.tokenKey);

  if (tokensJson) {
    try {
      const tokens: Tokens = JSON.parse(tokensJson);
      const token = tokens.access;

      if (token) {
        const authReq = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
        return next(authReq);
      }
    } catch (e) {
    }
  }

  return next(req);
};
