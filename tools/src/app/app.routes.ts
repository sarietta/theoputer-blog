import { Routes } from '@angular/router';
import { LogicGateEditorComponent } from './logic-gate-editor/logic-gate-editor.component';
import { FourierSquareComponent } from './fourier-square/fourier-square.component';
import { HomePageComponent } from './home-page/home-page.component'; // Import HomePageComponent

export const routes: Routes = [
    { path: '', component: HomePageComponent }, // Set HomePageComponent as the default route
    { path: 'logic-gates', component: LogicGateEditorComponent },
    { path: 'fourier-square', component: FourierSquareComponent },
];
