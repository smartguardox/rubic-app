import { Directive, EventEmitter, Input, Output } from '@angular/core';
import { AbstractControl, NG_ASYNC_VALIDATORS, ValidationErrors } from '@angular/forms';
import { Web3PublicService } from '../../services/blockchain/web3-public-service/web3-public.service';
import { BLOCKCHAIN_NAME, Token } from '../../services/blockchain/types/Blockchain';

@Directive({
  selector: '[appTokenAddress]',
  providers: [
    {
      provide: NG_ASYNC_VALIDATORS,
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      useExisting: TokenAddressDirective,
      multi: true
    }
  ]
})
export class TokenAddressDirective {
  @Input() blockchain: BLOCKCHAIN_NAME;

  @Output() tokenValidated = new EventEmitter<Token>();

  private readonly tokenAddressRegex = /^0x[A-Fa-f0-9]{40}$/;

  constructor(private web3: Web3PublicService) {}

  validate(control: AbstractControl): Promise<ValidationErrors | null> {
    return new Promise(resolve => {
      if (!control.value || !control.value.match(this.tokenAddressRegex)) {
        resolve({ incorrectAddress: true });
        return;
      }

      this.web3[this.blockchain]
        .getTokenInfo(control.value, this.blockchain)
        .then((token: Token) => {
          this.tokenValidated.emit(token);
          resolve(null);
        })
        .catch(err => {
          console.log(err);
          resolve({ tokenInfoError: err });
        });
    });
  }
}
