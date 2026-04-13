import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, NgIf],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
step = 1;

  goToStep2() {
    const step1Data = {
      name: (document.getElementById('userName') as HTMLInputElement)?.value,
      email: (document.getElementById('userEmail') as HTMLInputElement)?.value,
      password: (document.getElementById('userPassword') as HTMLInputElement)?.value,
      age: (document.getElementById('userAge') as HTMLInputElement)?.value,
      phone: (document.getElementById('userphone') as HTMLInputElement)?.value,
    };

    localStorage.setItem('register_step1', JSON.stringify(step1Data));
    this.step = 2;
  }

  register() {
    const step1Data = JSON.parse(localStorage.getItem('register_step1') || '{}');

    const step2Data = {
      height: (document.getElementById('userhight') as HTMLInputElement)?.value,
      weight: (document.getElementById('userWeight') as HTMLInputElement)?.value,
      gender: (document.querySelector('input[name="inlineRadioOptions"]:checked') as HTMLInputElement)?.value,
    };

    const finalData = {
      ...step1Data,
      ...step2Data
    };

    console.log(finalData);
  }
}
