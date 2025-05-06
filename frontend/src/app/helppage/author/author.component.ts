import { Component, Input, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MaterialModule } from "../../material.module";
import { HttpClient } from "@angular/common/http";

@Component({
  selector: "app-author",
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: "./author.component.html",
  styleUrl: "./author.component.scss",
})
export class AuthorComponent implements OnInit {
  @Input() username!: string;
  author: any = null;
  loading = true;
  private static cache: Map<string, any> = new Map();

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    if (!this.username) {
      console.error("No username provided");
      this.loading = false;
      return;
    }
    const cachedAuthor = AuthorComponent.cache.get(this.username);

    if (cachedAuthor !== undefined) {
      this.author = cachedAuthor;
      this.loading = false;
    } else {
      this.fetchAuthor();
    }
  }

  fetchAuthor(): void {
    const url = `https://api.github.com/users/${this.username}`;
    this.http.get(url).subscribe({
      next: (data) => {
        this.author = data;
        AuthorComponent.cache.set(this.username, data);
        this.loading = false;
      },
      error: (error) => {
        console.error("Error fetching user:", error);
        this.loading = false;
        this.author = null;
      },
    });
  }
}
