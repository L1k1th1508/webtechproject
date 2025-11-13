#include <stdio.h>
#include <unistd.h> // this library is used for time constraint

#include <stdlib.h>
#include <string.h>

struct userdetails {
    char name[30];
    char gender;
    int age;
    long long phone_number;
    char department[15];
    char consultationType[20];
    int priority;
};
struct node { // this stores info of the patient in a node
    struct userdetails info;
    struct node *next;
};

// these are the head nodes for their particular queues
struct node *General = NULL;
struct node *Cardio = NULL;

// this is for providing node its address and value
struct node *initialNode(struct userdetails details) {
    struct node *newNode = malloc(sizeof(struct node));
    newNode->info = details;
    newNode->next = NULL;
    return newNode;
}
//this is for adding the node into particular queue
void enqueue(struct node **head, struct userdetails details) {
    struct node *newnode = initialNode(details);//this will contain the 1st information details into the node
    
    
    if (*head == NULL || details.priority < (*head)->info.priority) {//this compares with the priority of details with next one and previous one 
        newnode->next = *head;
        *head = newnode;
    } else {
        struct node *temp = *head;
        
        while (temp->next != NULL && temp->next->info.priority <= details.priority) {
            temp = temp->next;
        }
        newnode->next = temp->next;
        temp->next = newnode;
    }
}
void dequeue(struct node **head) {
    
    if (*head == NULL) {
        printf("Queue is empty\n");
        return; 
    }
    struct node *temp = *head;
    struct userdetails details = temp->info; 
    printf("\nConsulting Patient: %s; Dept: %s; Type: %s\n", details.name, details.department, details.consultationType);
    if (strcmp(details.consultationType, "emergency") == 0) {
        sleep(10);
    } 
    
    
    else if (strcmp(details.consultationType, "surgery") == 0) {
        sleep(7);
    } 
    
    else if (strcmp(details.consultationType, "regular") == 0) {
        sleep(5);
    } else {
        sleep(3); 
    }
    
    *head = (*head)->next;
    free(temp);
}
void getdetails(struct node *head){
    if(head==NULL){
        printf("Doctor is available, you can register yourself\n");
        return;
    }
    
    else{
        struct node *temp=head;
    while(temp!=NULL){
        printf("Name:%s; Department:%s; Consultationtype:%s",temp->info.name,temp->info.department,temp->info.consultationType);
        printf("\n");
        temp=temp->next;
    }
}
    
}

void getUserDetails(struct userdetails *details) {
    char x = 'Y';

    while (x == 'Y' || x == 'y') {
        printf("\nEnter patient details:\n");

        printf("Name: ");
        scanf(" %[^\n]", details->name);
        do{
        printf("Gender (M/F): ");
        
        scanf(" %c", &details->gender);
        } while (details->gender != 'M' && details->gender != 'F');
    
        printf("Age: ");
        if(scanf("%d", &details->age)!=1){
            return ;
        }
        printf("Phone Number: ");
        if(scanf("%lld", &details->phone_number)!=1){
            return ;
        }
        
        printf("Department (Cardio/General): "); 
        scanf(" %s", &details->department); 

       if(strcmp(details->department,"General")==0){
            printf("Consultation Type (Firsttime/followup): ");
       }
       else{
        printf("Consultation Type (emergency/surgery/Firsttime/followup): ");
       }
        scanf(" %s", &details->consultationType); 

       
        if (strcmp(details->consultationType, "emergency") == 0) {
            details->priority = 1; 
        }
      
        else if (strcmp(details->consultationType, "surgery") == 0) {
            details->priority = 2;
        } 
        else if (strcmp(details->consultationType, "Firsttime") == 0) {
            details->priority = 3;
        } 
        else if (strcmp(details->consultationType, "followup") == 0) {
            details->priority = 4;
        } 
        else {
            printf("out of concepts to be added");
        }

        
        if (strcmp(details->department, "General") == 0)
            enqueue(&General, *details); 
        else if (strcmp(details->department, "Cardio") == 0)
            enqueue(&Cardio, *details);
        else {
            printf("this is not a multispeciality hospital");
        }
        
        printf("\nDo you want to add another patient (Y/N)? ");
        scanf(" %c", &x);
        if (x == 'Y' || x == 'y') {
           
            sleep(1); 
        }
        else{
            printf("patients available in queue is:\n");
            getdetails(Cardio);
            getdetails(General);

               
                
            }
        }
    }


int allQueuesEmpty() {
    return (General == NULL && Cardio == NULL); 
}

void consultingpatients() {
    
    while (!allQueuesEmpty()) {
        
        if (Cardio != NULL) {
            dequeue(&Cardio);
        }
        
        else if (General != NULL) {
            dequeue(&General);
        }
    }
    
}

int main() {
    struct userdetails details;
    printf("Hospital Management System\n");
    getUserDetails(&details);
    consultingpatients(); 
    return 0;
}
