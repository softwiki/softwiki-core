import { NoteModel, Tag, TagModel, TagProperties, NoteProperties } from "../Models";
import { ProjectModel, ProjectProperties } from "../Models/Project";

export default abstract class DataProvider
{
	public abstract Setup() : Promise<void>

	public abstract CreateNote(properties: NoteProperties) : Promise<NoteModel>
	public abstract GetNotes() : Promise<NoteModel[]>
	public abstract DeleteNote(note: NoteModel) : Promise<void>
	public abstract UpdateNote(note: NoteModel) : Promise<void>
	public abstract RemoveTagFromNote(note: NoteModel, tag: Tag) : Promise<void>
	public abstract AddTagToNote(note: NoteModel, tag: Tag) : Promise<void>

	public abstract CreateTag(properties: TagProperties) : Promise<TagModel>
	public abstract GetTags() : Promise<TagModel[]>
	public abstract DeleteTag(tag: TagModel) : Promise<void>
	public abstract UpdateTag(tag: TagModel) : Promise<void>

	public abstract CreateProject(properties: ProjectProperties) : Promise<ProjectModel>
	public abstract GetProjects() : Promise<ProjectModel[]>
	public abstract DeleteProject(tag: ProjectModel) : Promise<void>
	public abstract UpdateProject(tag: ProjectModel) : Promise<void>
}