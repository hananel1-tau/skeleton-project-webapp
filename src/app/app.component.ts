import { Component } from "@angular/core";
import * as signalR from "@aspnet/signalr";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { map, switchMap } from "rxjs/operators";

interface SignalRConnection {
  url: string;
  accessToken: string;
}

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.less"]
})
export class AppComponent {
  private readonly httpOptions = { headers: new HttpHeaders({ "Content-Type": "application/json" }) };
  private readonly negotiateUrl = "https://functionapps20220420132432.azurewebsites.net/api/negotiate";
  private readonly getCounterUrl = "https://functionapps20220420132432.azurewebsites.net/api/GetCounter";
  private readonly updateCounterUrl = "https://functionapps20220420132432.azurewebsites.net/api/UpdateCounter?Counter=";
  private readonly connectionString = "HostName=SkeletonProjectIoTHub.azure-devices.net;DeviceId=mydevice;SharedAccessKey=PdSwP8p762GYsTX8uXghZMf9SKAPy/4NbwufRhjmyyQ=";

  private readonly counterId = 1;

  private hubConnection: signalR.HubConnection;
  private counter: number = 0;

  constructor(private readonly http: HttpClient) {
    const negotiateBody = { UserId: "SomeUser" };

    this.http
      .post<SignalRConnection>(this.negotiateUrl, JSON.stringify(negotiateBody), this.httpOptions)
      .pipe(
        map(connectionDetails =>
          new signalR.HubConnectionBuilder().withUrl(`${connectionDetails.url}`, { accessTokenFactory: () => connectionDetails.accessToken }).build()
        )
      )
      .subscribe(hub => {
        this.hubConnection = hub;
        hub.on("CounterChanged", data => {
          console.log(data);
          this.counter = parseInt(data);
        });
        hub.start();
      });

    this.http.get<number>(this.getCounterUrl).subscribe(cloudCounter => {
      console.log(cloudCounter);
      this.counter = cloudCounter;
    });
  }

  public increaseCounterDirect(): void {
    this.http
      .get(this.updateCounterUrl + (this.counter + 1), this.httpOptions)
      .toPromise()
      .catch(e => console.log(e));
  }

  public increaseCounterIoT(): void {
    // TODO
    this.increaseCounterDirect();
  }

  public getDeviceName(): string {
    return "my_device";
  }
}
